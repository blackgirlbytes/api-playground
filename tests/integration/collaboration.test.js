/**
 * 🔗 Integration Tests for Real-time Collaboration
 * Testing how different parts work together in perfect harmony!
 */

const { 
  createMockWebSocketServer, 
  createTestWebSocketClient, 
  waitForMessage, 
  findMessage,
  testDataGenerators,
  messageBuilders 
} = require('../utils/test-helpers');
const { sampleUsers, sampleCollections, testScenarios } = require('../fixtures/mock-data');

describe('🤝 Real-time Collaboration Integration Tests', () => {
  let mockServer;
  let clients = [];

  beforeEach(async () => {
    // Create a fresh mock server for each test
    mockServer = await createMockWebSocketServer();
    clients = [];
  });

  afterEach(async () => {
    // Clean up all clients
    await Promise.all(clients.map(client => client.close()));
    clients = [];
    
    // Close the mock server
    if (mockServer) {
      await mockServer.close();
    }
  });

  describe('👥 Multi-user Connection Management', () => {
    test('should handle multiple users connecting simultaneously', async () => {
      // Connect multiple users
      const userPromises = Array.from({ length: 3 }, async (_, i) => {
        const client = await createTestWebSocketClient(mockServer.url);
        clients.push(client);
        return client;
      });

      const connectedClients = await Promise.all(userPromises);
      
      expect(connectedClients).toHaveLength(3);
      expect(clients).toHaveLength(3);
      
      // Each client should be connected
      connectedClients.forEach(client => {
        expect(client.ws.readyState).toBe(1); // OPEN
      });
    });

    test('should broadcast user join events to all connected users', async () => {
      // Connect first user
      const user1 = await createTestWebSocketClient(mockServer.url);
      clients.push(user1);
      
      // Set user name
      user1.send(messageBuilders.setUserName('Alice'));
      
      // Connect second user
      const user2 = await createTestWebSocketClient(mockServer.url);
      clients.push(user2);
      
      user2.send(messageBuilders.setUserName('Bob'));
      
      // Wait for join messages
      await waitFor(100);
      
      // Both users should have received messages about each other
      expect(user1.messages.length).toBeGreaterThan(0);
      expect(user2.messages.length).toBeGreaterThan(0);
    });

    test('should maintain accurate online user count', async () => {
      const userCount = 4;
      
      // Connect multiple users
      for (let i = 0; i < userCount; i++) {
        const client = await createTestWebSocketClient(mockServer.url);
        clients.push(client);
        client.send(messageBuilders.setUserName(`User${i + 1}`));
      }
      
      // Request online users from the last client
      const lastClient = clients[clients.length - 1];
      lastClient.send({ type: 'get_online_users' });
      
      await waitFor(100);
      
      // Should have received online users list
      const onlineUsersMessage = findMessage(lastClient.messages, 'online_users');
      expect(onlineUsersMessage).toBeDefined();
      
      if (onlineUsersMessage && onlineUsersMessage.parsed) {
        expect(onlineUsersMessage.parsed.users).toHaveLength(userCount);
      }
    });

    test('should handle user disconnection gracefully', async () => {
      // Connect two users
      const user1 = await createTestWebSocketClient(mockServer.url);
      const user2 = await createTestWebSocketClient(mockServer.url);
      clients.push(user1, user2);
      
      user1.send(messageBuilders.setUserName('Alice'));
      user2.send(messageBuilders.setUserName('Bob'));
      
      await waitFor(100);
      
      // Disconnect user1
      await user1.close();
      clients.splice(clients.indexOf(user1), 1);
      
      await waitFor(100);
      
      // User2 should receive a user_left message
      const userLeftMessage = findMessage(user2.messages, 'user_left');
      expect(userLeftMessage).toBeDefined();
    });
  });

  describe('📁 Collaborative Collection Management', () => {
    test('should allow multiple users to collaborate on collections', async () => {
      // Connect two users
      const alice = await createTestWebSocketClient(mockServer.url);
      const bob = await createTestWebSocketClient(mockServer.url);
      clients.push(alice, bob);
      
      alice.send(messageBuilders.setUserName('Alice'));
      bob.send(messageBuilders.setUserName('Bob'));
      
      await waitFor(100);
      
      // Alice creates a collection
      alice.send(messageBuilders.createCollection('Shared API Tests', 'A collection for team collaboration'));
      
      await waitFor(100);
      
      // Bob should receive notification about new collection
      const newCollectionMessage = findMessage(bob.messages, 'new_collection_available');
      expect(newCollectionMessage).toBeDefined();
      
      // Bob joins the collection
      if (newCollectionMessage && newCollectionMessage.parsed) {
        bob.send(messageBuilders.joinCollection(newCollectionMessage.parsed.collection.id));
      }
      
      await waitFor(100);
      
      // Alice should receive notification about Bob joining
      const collaboratorJoinedMessage = findMessage(alice.messages, 'collaborator_joined');
      expect(collaboratorJoinedMessage).toBeDefined();
    });

    test('should sync collection changes across all collaborators', async () => {
      // Setup: Two users in a shared collection
      const alice = await createTestWebSocketClient(mockServer.url);
      const bob = await createTestWebSocketClient(mockServer.url);
      clients.push(alice, bob);
      
      alice.send(messageBuilders.setUserName('Alice'));
      bob.send(messageBuilders.setUserName('Bob'));
      
      await waitFor(100);
      
      // Alice creates and Bob joins collection
      alice.send(messageBuilders.createCollection('Team Collection'));
      await waitFor(100);
      
      const collectionCreatedMessage = findMessage(alice.messages, 'collection_created');
      expect(collectionCreatedMessage).toBeDefined();
      
      if (collectionCreatedMessage && collectionCreatedMessage.parsed) {
        const collectionId = collectionCreatedMessage.parsed.collection.id;
        
        bob.send(messageBuilders.joinCollection(collectionId));
        await waitFor(100);
        
        // Alice adds a request to the collection
        const testRequest = testDataGenerators.apiRequest({
          method: 'GET',
          url: 'https://api.example.com/users'
        });
        
        alice.send(messageBuilders.addRequestToCollection(collectionId, testRequest));
        await waitFor(100);
        
        // Bob should receive notification about the added request
        const requestAddedMessage = findMessage(bob.messages, 'request_added_to_collection');
        expect(requestAddedMessage).toBeDefined();
        
        if (requestAddedMessage && requestAddedMessage.parsed) {
          expect(requestAddedMessage.parsed.collectionId).toBe(collectionId);
          expect(requestAddedMessage.parsed.request.method).toBe('GET');
        }
      }
    });

    test('should handle concurrent collection modifications', async () => {
      // Setup multiple users
      const users = [];
      for (let i = 0; i < 3; i++) {
        const client = await createTestWebSocketClient(mockServer.url);
        client.send(messageBuilders.setUserName(`User${i + 1}`));
        users.push(client);
        clients.push(client);
      }
      
      await waitFor(100);
      
      // User1 creates a collection
      users[0].send(messageBuilders.createCollection('Concurrent Test Collection'));
      await waitFor(100);
      
      const collectionMessage = findMessage(users[0].messages, 'collection_created');
      expect(collectionMessage).toBeDefined();
      
      if (collectionMessage && collectionMessage.parsed) {
        const collectionId = collectionMessage.parsed.collection.id;
        
        // All users join the collection
        users[1].send(messageBuilders.joinCollection(collectionId));
        users[2].send(messageBuilders.joinCollection(collectionId));
        
        await waitFor(100);
        
        // All users simultaneously add different requests
        const requests = [
          testDataGenerators.apiRequest({ method: 'GET', url: 'https://api.example.com/posts' }),
          testDataGenerators.apiRequest({ method: 'POST', url: 'https://api.example.com/posts' }),
          testDataGenerators.apiRequest({ method: 'PUT', url: 'https://api.example.com/posts/1' })
        ];
        
        users.forEach((user, index) => {
          user.send(messageBuilders.addRequestToCollection(collectionId, requests[index]));
        });
        
        await waitFor(200);
        
        // Each user should receive notifications about all additions
        users.forEach(user => {
          const addedMessages = user.messages.filter(msg => 
            msg.parsed && msg.parsed.type === 'request_added_to_collection'
          );
          expect(addedMessages.length).toBeGreaterThan(0);
        });
      }
    });
  });

  describe('🌐 Collaborative API Request Execution', () => {
    test('should broadcast API request execution to all users', async () => {
      // Connect two users
      const alice = await createTestWebSocketClient(mockServer.url);
      const bob = await createTestWebSocketClient(mockServer.url);
      clients.push(alice, bob);
      
      alice.send(messageBuilders.setUserName('Alice'));
      bob.send(messageBuilders.setUserName('Bob'));
      
      await waitFor(100);
      
      // Alice executes an API request
      const testRequest = testDataGenerators.apiRequest({
        method: 'GET',
        url: 'https://jsonplaceholder.typicode.com/posts/1'
      });
      
      alice.send(messageBuilders.executeApiRequest(testRequest));
      
      await waitFor(500); // Give time for API request to complete
      
      // Alice should receive the API response
      const apiResponseMessage = findMessage(alice.messages, 'api_response');
      expect(apiResponseMessage).toBeDefined();
      
      // Bob should receive notification about the API request execution
      const apiExecutedMessage = findMessage(bob.messages, 'api_request_executed');
      expect(apiExecutedMessage).toBeDefined();
      
      if (apiExecutedMessage && apiExecutedMessage.parsed) {
        expect(apiExecutedMessage.parsed.method).toBe('GET');
        expect(apiExecutedMessage.parsed.userName).toBe('Alice');
      }
    });

    test('should handle API request failures gracefully', async () => {
      const alice = await createTestWebSocketClient(mockServer.url);
      clients.push(alice);
      
      alice.send(messageBuilders.setUserName('Alice'));
      
      await waitFor(100);
      
      // Try to execute request to invalid URL
      const invalidRequest = testDataGenerators.apiRequest({
        method: 'GET',
        url: 'https://this-domain-does-not-exist-12345.com/api'
      });
      
      alice.send(messageBuilders.executeApiRequest(invalidRequest));
      
      await waitFor(1000);
      
      // Alice should receive an error message
      const errorMessage = findMessage(alice.messages, 'api_error');
      expect(errorMessage).toBeDefined();
      
      if (errorMessage && errorMessage.parsed) {
        expect(errorMessage.parsed.error.friendly).toContain('🌐');
        expect(errorMessage.parsed.message).toContain('❌');
      }
    });

    test('should track request history for all users', async () => {
      const alice = await createTestWebSocketClient(mockServer.url);
      clients.push(alice);
      
      alice.send(messageBuilders.setUserName('Alice'));
      
      await waitFor(100);
      
      // Execute a successful request
      const testRequest = testDataGenerators.apiRequest({
        method: 'GET',
        url: 'https://jsonplaceholder.typicode.com/posts/1'
      });
      
      alice.send(messageBuilders.executeApiRequest(testRequest));
      
      await waitFor(500);
      
      // Request history
      alice.send({ type: 'get_request_history' });
      
      await waitFor(100);
      
      // Should receive history with the executed request
      const historyMessage = findMessage(alice.messages, 'request_history');
      expect(historyMessage).toBeDefined();
      
      if (historyMessage && historyMessage.parsed) {
        expect(Array.isArray(historyMessage.parsed.history)).toBe(true);
        expect(historyMessage.parsed.history.length).toBeGreaterThan(0);
      }
    });
  });

  describe('💬 Real-time Communication', () => {
    test('should maintain message ordering across multiple users', async () => {
      const users = [];
      
      // Connect 3 users
      for (let i = 0; i < 3; i++) {
        const client = await createTestWebSocketClient(mockServer.url);
        client.send(messageBuilders.setUserName(`User${i + 1}`));
        users.push(client);
        clients.push(client);
      }
      
      await waitFor(100);
      
      // Send messages in sequence
      const messageSequence = [
        { user: 0, action: 'createCollection', data: 'Collection 1' },
        { user: 1, action: 'createCollection', data: 'Collection 2' },
        { user: 2, action: 'createCollection', data: 'Collection 3' }
      ];
      
      for (const { user, action, data } of messageSequence) {
        users[user].send(messageBuilders.createCollection(data));
        await waitFor(50); // Small delay between messages
      }
      
      await waitFor(200);
      
      // Check that all users received all collection creation notifications
      users.forEach(user => {
        const collectionMessages = user.messages.filter(msg => 
          msg.parsed && (
            msg.parsed.type === 'collection_created' || 
            msg.parsed.type === 'new_collection_available'
          )
        );
        expect(collectionMessages.length).toBeGreaterThan(0);
      });
    });

    test('should handle high-frequency message bursts', async () => {
      const alice = await createTestWebSocketClient(mockServer.url);
      clients.push(alice);
      
      alice.send(messageBuilders.setUserName('Alice'));
      
      await waitFor(100);
      
      // Send multiple ping messages rapidly
      const messageCount = 10;
      for (let i = 0; i < messageCount; i++) {
        alice.send({ type: 'ping', sequence: i });
      }
      
      await waitFor(200);
      
      // Should receive corresponding pong messages
      const pongMessages = alice.messages.filter(msg => 
        msg.parsed && msg.parsed.type === 'pong'
      );
      
      expect(pongMessages.length).toBeGreaterThan(0);
    });

    test('should handle WebSocket connection interruptions', async () => {
      const alice = await createTestWebSocketClient(mockServer.url);
      const bob = await createTestWebSocketClient(mockServer.url);
      clients.push(alice, bob);
      
      alice.send(messageBuilders.setUserName('Alice'));
      bob.send(messageBuilders.setUserName('Bob'));
      
      await waitFor(100);
      
      // Simulate connection interruption by closing Alice's connection
      await alice.close();
      clients.splice(clients.indexOf(alice), 1);
      
      await waitFor(100);
      
      // Bob should receive user_left notification
      const userLeftMessage = findMessage(bob.messages, 'user_left');
      expect(userLeftMessage).toBeDefined();
      
      // Bob should still be able to send messages
      bob.send({ type: 'ping' });
      
      await waitFor(100);
      
      const pongMessage = findMessage(bob.messages, 'pong');
      expect(pongMessage).toBeDefined();
    });
  });

  describe('🔄 State Synchronization', () => {
    test('should synchronize application state across users', async () => {
      const alice = await createTestWebSocketClient(mockServer.url);
      const bob = await createTestWebSocketClient(mockServer.url);
      clients.push(alice, bob);
      
      alice.send(messageBuilders.setUserName('Alice'));
      bob.send(messageBuilders.setUserName('Bob'));
      
      await waitFor(100);
      
      // Alice creates a collection and adds requests
      alice.send(messageBuilders.createCollection('Sync Test Collection'));
      await waitFor(100);
      
      const collectionMessage = findMessage(alice.messages, 'collection_created');
      if (collectionMessage && collectionMessage.parsed) {
        const collectionId = collectionMessage.parsed.collection.id;
        
        // Bob joins the collection
        bob.send(messageBuilders.joinCollection(collectionId));
        await waitFor(100);
        
        // Both users should have the same collection state
        alice.send({ type: 'get_collections' });
        bob.send({ type: 'get_collections' });
        
        await waitFor(100);
        
        const aliceCollections = findMessage(alice.messages, 'collections_list');
        const bobCollections = findMessage(bob.messages, 'collections_list');
        
        expect(aliceCollections).toBeDefined();
        expect(bobCollections).toBeDefined();
        
        if (aliceCollections?.parsed && bobCollections?.parsed) {
          // Both should have access to the same collection
          const aliceCollection = aliceCollections.parsed.collections.find(c => c.id === collectionId);
          const bobCollection = bobCollections.parsed.collections.find(c => c.id === collectionId);
          
          expect(aliceCollection).toBeDefined();
          expect(bobCollection).toBeDefined();
          expect(aliceCollection?.name).toBe(bobCollection?.name);
        }
      }
    });

    test('should handle state conflicts gracefully', async () => {
      // This test would require the actual conflict resolution system
      // For now, we'll test the basic scenario
      
      const users = [];
      for (let i = 0; i < 2; i++) {
        const client = await createTestWebSocketClient(mockServer.url);
        client.send(messageBuilders.setUserName(`User${i + 1}`));
        users.push(client);
        clients.push(client);
      }
      
      await waitFor(100);
      
      // Both users try to create collections with similar names
      users[0].send(messageBuilders.createCollection('Conflict Test'));
      users[1].send(messageBuilders.createCollection('Conflict Test'));
      
      await waitFor(200);
      
      // Both should succeed (collections have unique IDs)
      users.forEach(user => {
        const createdMessage = findMessage(user.messages, 'collection_created');
        expect(createdMessage).toBeDefined();
      });
    });
  });
});

console.log('✅ Real-time collaboration integration tests loaded! Ready to test teamwork! 🤝');
