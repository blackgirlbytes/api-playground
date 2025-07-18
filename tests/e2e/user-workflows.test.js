/**
 * 🎯 End-to-End Tests for Complete User Workflows
 * Testing the entire user journey from connection to collaboration!
 */

const { 
  createMockWebSocketServer, 
  createTestWebSocketClient, 
  waitForMessage, 
  findMessage,
  testDataGenerators,
  messageBuilders 
} = require('../utils/test-helpers');
const { testScenarios } = require('../fixtures/mock-data');

describe('🎯 Complete User Workflows E2E Tests', () => {
  let mockServer;
  let clients = [];

  beforeEach(async () => {
    mockServer = await createMockWebSocketServer();
    clients = [];
  });

  afterEach(async () => {
    await Promise.all(clients.map(client => client.close()));
    clients = [];
    
    if (mockServer) {
      await mockServer.close();
    }
  });

  describe('👤 Single User Complete Journey', () => {
    test('should complete full user onboarding and API testing workflow', async () => {
      const alice = await createTestWebSocketClient(mockServer.url);
      clients.push(alice);
      
      // Step 1: Connect and receive welcome
      await waitFor(100);
      const welcomeMessage = findMessage(alice.messages, 'connection_established');
      expect(welcomeMessage).toBeDefined();
      expect(welcomeMessage?.parsed?.message).toContain('🎉');
      
      // Step 2: Set user name
      alice.send(messageBuilders.setUserName('Alice Explorer'));
      await waitFor(100);
      
      const nameUpdatedMessage = findMessage(alice.messages, 'name_updated');
      expect(nameUpdatedMessage).toBeDefined();
      expect(nameUpdatedMessage?.parsed?.message).toContain('✅');
      
      // Step 3: Create a collection
      alice.send(messageBuilders.createCollection('My First API Collection', 'Learning to test APIs'));
      await waitFor(100);
      
      const collectionCreatedMessage = findMessage(alice.messages, 'collection_created');
      expect(collectionCreatedMessage).toBeDefined();
      expect(collectionCreatedMessage?.parsed?.collection?.name).toBe('My First API Collection');
      
      const collectionId = collectionCreatedMessage?.parsed?.collection?.id;
      expect(collectionId).toBeDefined();
      
      // Step 4: Add API requests to collection
      const apiRequest = testDataGenerators.apiRequest({
        method: 'GET',
        url: 'https://jsonplaceholder.typicode.com/posts/1',
        description: 'Get a single post'
      });
      
      alice.send(messageBuilders.addRequestToCollection(collectionId, apiRequest));
      await waitFor(100);
      
      const requestAddedMessage = findMessage(alice.messages, 'request_added_to_collection');
      expect(requestAddedMessage).toBeDefined();
      
      // Step 5: Execute the API request
      alice.send(messageBuilders.executeApiRequest(apiRequest));
      await waitFor(1000); // Wait for API response
      
      const apiResponseMessage = findMessage(alice.messages, 'api_response');
      expect(apiResponseMessage).toBeDefined();
      expect(apiResponseMessage?.parsed?.message).toContain('✅');
      
      // Step 6: Check request history
      alice.send({ type: 'get_request_history' });
      await waitFor(100);
      
      const historyMessage = findMessage(alice.messages, 'request_history');
      expect(historyMessage).toBeDefined();
      expect(Array.isArray(historyMessage?.parsed?.history)).toBe(true);
      expect(historyMessage?.parsed?.history?.length).toBeGreaterThan(0);
      
      // Step 7: Get collections list
      alice.send({ type: 'get_collections' });
      await waitFor(100);
      
      const collectionsMessage = findMessage(alice.messages, 'collections_list');
      expect(collectionsMessage).toBeDefined();
      expect(collectionsMessage?.parsed?.collections?.length).toBeGreaterThan(0);
      
      // Verify complete workflow success
      expect(alice.messages.length).toBeGreaterThan(7); // Multiple messages received
    });

    test('should handle error recovery in user workflow', async () => {
      const alice = await createTestWebSocketClient(mockServer.url);
      clients.push(alice);
      
      alice.send(messageBuilders.setUserName('Alice'));
      await waitFor(100);
      
      // Try to execute invalid API request
      const invalidRequest = testDataGenerators.apiRequest({
        method: 'GET',
        url: 'https://invalid-domain-12345.com/api'
      });
      
      alice.send(messageBuilders.executeApiRequest(invalidRequest));
      await waitFor(2000);
      
      // Should receive kid-friendly error
      const errorMessage = findMessage(alice.messages, 'api_error');
      expect(errorMessage).toBeDefined();
      expect(errorMessage?.parsed?.error?.friendly).toMatch(/[🌐🚪⏰📝🔒💥❌🤔]/);
      
      // User should be able to continue with valid request
      const validRequest = testDataGenerators.apiRequest({
        method: 'GET',
        url: 'https://jsonplaceholder.typicode.com/posts/1'
      });
      
      alice.send(messageBuilders.executeApiRequest(validRequest));
      await waitFor(1000);
      
      const successMessage = findMessage(alice.messages, 'api_response');
      expect(successMessage).toBeDefined();
      
      // Workflow should continue normally after error
      alice.send({ type: 'get_request_history' });
      await waitFor(100);
      
      const historyMessage = findMessage(alice.messages, 'request_history');
      expect(historyMessage).toBeDefined();
    });

    test('should persist user session data throughout workflow', async () => {
      const alice = await createTestWebSocketClient(mockServer.url);
      clients.push(alice);
      
      alice.send(messageBuilders.setUserName('Alice Persistent'));
      await waitFor(100);
      
      // Create collection
      alice.send(messageBuilders.createCollection('Persistent Collection'));
      await waitFor(100);
      
      const collectionMessage = findMessage(alice.messages, 'collection_created');
      const collectionId = collectionMessage?.parsed?.collection?.id;
      
      // Add multiple requests
      const requests = [
        testDataGenerators.apiRequest({ method: 'GET', url: 'https://jsonplaceholder.typicode.com/posts' }),
        testDataGenerators.apiRequest({ method: 'GET', url: 'https://jsonplaceholder.typicode.com/users' }),
        testDataGenerators.apiRequest({ method: 'GET', url: 'https://jsonplaceholder.typicode.com/albums' })
      ];
      
      for (const request of requests) {
        alice.send(messageBuilders.addRequestToCollection(collectionId, request));
        await waitFor(100);
      }
      
      // Verify all data persisted
      alice.send({ type: 'get_collections' });
      await waitFor(100);
      
      const collectionsMessage = findMessage(alice.messages, 'collections_list');
      const collection = collectionsMessage?.parsed?.collections?.find(c => c.id === collectionId);
      
      expect(collection).toBeDefined();
      expect(collection?.requests?.length).toBe(3);
      expect(collection?.name).toBe('Persistent Collection');
    });
  });

  describe('👥 Multi-User Collaboration Workflows', () => {
    test('should complete full team collaboration workflow', async () => {
      // Step 1: Team members connect
      const alice = await createTestWebSocketClient(mockServer.url);
      const bob = await createTestWebSocketClient(mockServer.url);
      const charlie = await createTestWebSocketClient(mockServer.url);
      clients.push(alice, bob, charlie);
      
      alice.send(messageBuilders.setUserName('Alice Team Lead'));
      bob.send(messageBuilders.setUserName('Bob Developer'));
      charlie.send(messageBuilders.setUserName('Charlie Tester'));
      
      await waitFor(200);
      
      // Step 2: Alice creates team collection
      alice.send(messageBuilders.createCollection('Team API Project', 'Collaborative API testing for our project'));
      await waitFor(100);
      
      const collectionMessage = findMessage(alice.messages, 'collection_created');
      const collectionId = collectionMessage?.parsed?.collection?.id;
      
      // Step 3: Team members join collection
      bob.send(messageBuilders.joinCollection(collectionId));
      charlie.send(messageBuilders.joinCollection(collectionId));
      
      await waitFor(200);
      
      // Verify collaboration notifications
      const bobJoinedMessage = findMessage(alice.messages, 'collaborator_joined');
      const charlieJoinedMessage = findMessage(alice.messages, 'collaborator_joined');
      
      expect(bobJoinedMessage).toBeDefined();
      expect(charlieJoinedMessage).toBeDefined();
      
      // Step 4: Team members add different API requests
      const aliceRequest = testDataGenerators.apiRequest({
        method: 'GET',
        url: 'https://jsonplaceholder.typicode.com/posts',
        description: 'Get all posts - Alice'
      });
      
      const bobRequest = testDataGenerators.apiRequest({
        method: 'POST',
        url: 'https://jsonplaceholder.typicode.com/posts',
        body: { title: 'Test Post', body: 'Test content', userId: 1 },
        description: 'Create post - Bob'
      });
      
      const charlieRequest = testDataGenerators.apiRequest({
        method: 'GET',
        url: 'https://jsonplaceholder.typicode.com/users',
        description: 'Get users - Charlie'
      });
      
      alice.send(messageBuilders.addRequestToCollection(collectionId, aliceRequest));
      bob.send(messageBuilders.addRequestToCollection(collectionId, bobRequest));
      charlie.send(messageBuilders.addRequestToCollection(collectionId, charlieRequest));
      
      await waitFor(300);
      
      // Step 5: Team members execute requests and see each other's work
      alice.send(messageBuilders.executeApiRequest(aliceRequest));
      await waitFor(800);
      
      bob.send(messageBuilders.executeApiRequest(bobRequest));
      await waitFor(800);
      
      // Step 6: Verify cross-user notifications
      const aliceExecutionNotification = findMessage(bob.messages, 'api_request_executed');
      const bobExecutionNotification = findMessage(charlie.messages, 'api_request_executed');
      
      expect(aliceExecutionNotification).toBeDefined();
      expect(bobExecutionNotification).toBeDefined();
      
      // Step 7: All team members check final collection state
      alice.send({ type: 'get_collections' });
      bob.send({ type: 'get_collections' });
      charlie.send({ type: 'get_collections' });
      
      await waitFor(200);
      
      // Verify all team members have consistent collection state
      const aliceCollections = findMessage(alice.messages, 'collections_list');
      const bobCollections = findMessage(bob.messages, 'collections_list');
      const charlieCollections = findMessage(charlie.messages, 'collections_list');
      
      expect(aliceCollections).toBeDefined();
      expect(bobCollections).toBeDefined();
      expect(charlieCollections).toBeDefined();
      
      // All should have the same collection with all requests
      [aliceCollections, bobCollections, charlieCollections].forEach(msg => {
        const collection = msg?.parsed?.collections?.find(c => c.id === collectionId);
        expect(collection).toBeDefined();
        expect(collection?.requests?.length).toBe(3);
        expect(collection?.collaborators?.length).toBe(3);
      });
    });

    test('should handle team member disconnection gracefully', async () => {
      const alice = await createTestWebSocketClient(mockServer.url);
      const bob = await createTestWebSocketClient(mockServer.url);
      clients.push(alice, bob);
      
      alice.send(messageBuilders.setUserName('Alice'));
      bob.send(messageBuilders.setUserName('Bob'));
      
      await waitFor(100);
      
      // Create shared workspace
      alice.send(messageBuilders.createCollection('Shared Workspace'));
      await waitFor(100);
      
      const collectionMessage = findMessage(alice.messages, 'collection_created');
      const collectionId = collectionMessage?.parsed?.collection?.id;
      
      bob.send(messageBuilders.joinCollection(collectionId));
      await waitFor(100);
      
      // Bob disconnects
      await bob.close();
      clients.splice(clients.indexOf(bob), 1);
      
      await waitFor(200);
      
      // Alice should receive disconnection notification
      const userLeftMessage = findMessage(alice.messages, 'user_left');
      expect(userLeftMessage).toBeDefined();
      
      // Alice should still be able to work normally
      alice.send(messageBuilders.addRequestToCollection(collectionId, 
        testDataGenerators.apiRequest({ method: 'GET' })
      ));
      
      await waitFor(100);
      
      const requestAddedMessage = findMessage(alice.messages, 'request_added_to_collection');
      expect(requestAddedMessage).toBeDefined();
      
      // Bob reconnects
      const bobReconnected = await createTestWebSocketClient(mockServer.url);
      clients.push(bobReconnected);
      
      bobReconnected.send(messageBuilders.setUserName('Bob'));
      bobReconnected.send(messageBuilders.joinCollection(collectionId));
      
      await waitFor(200);
      
      // Bob should see updated collection state
      bobReconnected.send({ type: 'get_collections' });
      await waitFor(100);
      
      const updatedCollections = findMessage(bobReconnected.messages, 'collections_list');
      expect(updatedCollections).toBeDefined();
    });

    test('should handle concurrent operations from multiple users', async () => {
      const users = [];
      const userNames = ['Alice', 'Bob', 'Charlie', 'Diana'];
      
      // Connect multiple users
      for (const name of userNames) {
        const client = await createTestWebSocketClient(mockServer.url);
        client.send(messageBuilders.setUserName(name));
        users.push(client);
        clients.push(client);
      }
      
      await waitFor(200);
      
      // First user creates collection
      users[0].send(messageBuilders.createCollection('Concurrent Operations Test'));
      await waitFor(100);
      
      const collectionMessage = findMessage(users[0].messages, 'collection_created');
      const collectionId = collectionMessage?.parsed?.collection?.id;
      
      // All users join collection
      for (let i = 1; i < users.length; i++) {
        users[i].send(messageBuilders.joinCollection(collectionId));
      }
      
      await waitFor(200);
      
      // All users perform operations simultaneously
      const operations = users.map((user, index) => ({
        user,
        request: testDataGenerators.apiRequest({
          method: ['GET', 'POST', 'PUT', 'DELETE'][index],
          url: `https://jsonplaceholder.typicode.com/posts/${index + 1}`
        })
      }));
      
      // Execute all operations at once
      operations.forEach(({ user, request }) => {
        user.send(messageBuilders.addRequestToCollection(collectionId, request));
        user.send(messageBuilders.executeApiRequest(request));
      });
      
      await waitFor(2000);
      
      // All users should receive notifications about all operations
      users.forEach(user => {
        const addedMessages = user.messages.filter(msg => 
          msg.parsed && msg.parsed.type === 'request_added_to_collection'
        );
        const executedMessages = user.messages.filter(msg => 
          msg.parsed && msg.parsed.type === 'api_request_executed'
        );
        
        expect(addedMessages.length).toBeGreaterThan(0);
        expect(executedMessages.length).toBeGreaterThan(0);
      });
      
      // Final state should be consistent
      users.forEach(user => {
        user.send({ type: 'get_collections' });
      });
      
      await waitFor(300);
      
      // All users should have the same final collection state
      const finalStates = users.map(user => 
        findMessage(user.messages, 'collections_list')
      );
      
      finalStates.forEach(state => {
        expect(state).toBeDefined();
        const collection = state?.parsed?.collections?.find(c => c.id === collectionId);
        expect(collection).toBeDefined();
        expect(collection?.requests?.length).toBe(4); // All requests added
      });
    });
  });

  describe('🌐 API Request Execution Workflows', () => {
    test('should complete comprehensive API testing workflow', async () => {
      const alice = await createTestWebSocketClient(mockServer.url);
      clients.push(alice);
      
      alice.send(messageBuilders.setUserName('Alice API Tester'));
      await waitFor(100);
      
      // Create API testing collection
      alice.send(messageBuilders.createCollection('Comprehensive API Tests', 'Testing all HTTP methods'));
      await waitFor(100);
      
      const collectionMessage = findMessage(alice.messages, 'collection_created');
      const collectionId = collectionMessage?.parsed?.collection?.id;
      
      // Test different HTTP methods
      const testCases = [
        {
          name: 'GET Request',
          request: testDataGenerators.apiRequest({
            method: 'GET',
            url: 'https://jsonplaceholder.typicode.com/posts/1'
          })
        },
        {
          name: 'POST Request',
          request: testDataGenerators.apiRequest({
            method: 'POST',
            url: 'https://jsonplaceholder.typicode.com/posts',
            headers: { 'Content-Type': 'application/json' },
            body: { title: 'Test Post', body: 'Test content', userId: 1 }
          })
        },
        {
          name: 'PUT Request',
          request: testDataGenerators.apiRequest({
            method: 'PUT',
            url: 'https://jsonplaceholder.typicode.com/posts/1',
            headers: { 'Content-Type': 'application/json' },
            body: { id: 1, title: 'Updated Post', body: 'Updated content', userId: 1 }
          })
        }
      ];
      
      // Add all test cases to collection
      for (const testCase of testCases) {
        alice.send(messageBuilders.addRequestToCollection(collectionId, testCase.request));
        await waitFor(100);
      }
      
      // Execute all test cases
      for (const testCase of testCases) {
        alice.send(messageBuilders.executeApiRequest(testCase.request));
        await waitFor(1000); // Wait for each API response
        
        const responseMessage = findMessage(alice.messages, 'api_response');
        expect(responseMessage).toBeDefined();
        expect(responseMessage?.parsed?.response?.status).toBeGreaterThanOrEqual(200);
        expect(responseMessage?.parsed?.response?.status).toBeLessThan(300);
      }
      
      // Verify comprehensive history
      alice.send({ type: 'get_request_history' });
      await waitFor(100);
      
      const historyMessage = findMessage(alice.messages, 'request_history');
      expect(historyMessage).toBeDefined();
      expect(historyMessage?.parsed?.history?.length).toBe(testCases.length);
      
      // Verify different methods in history
      const methods = historyMessage?.parsed?.history?.map(entry => entry.request.method);
      expect(methods).toContain('GET');
      expect(methods).toContain('POST');
      expect(methods).toContain('PUT');
    });

    test('should handle mixed success and failure scenarios', async () => {
      const alice = await createTestWebSocketClient(mockServer.url);
      clients.push(alice);
      
      alice.send(messageBuilders.setUserName('Alice'));
      await waitFor(100);
      
      // Mix of valid and invalid requests
      const requests = [
        testDataGenerators.apiRequest({
          method: 'GET',
          url: 'https://jsonplaceholder.typicode.com/posts/1' // Valid
        }),
        testDataGenerators.apiRequest({
          method: 'GET',
          url: 'https://invalid-domain-12345.com/api' // Invalid domain
        }),
        testDataGenerators.apiRequest({
          method: 'GET',
          url: 'https://jsonplaceholder.typicode.com/posts/999999' // Valid domain, might return 404
        })
      ];
      
      let successCount = 0;
      let errorCount = 0;
      
      for (const request of requests) {
        alice.send(messageBuilders.executeApiRequest(request));
        await waitFor(1500);
        
        const responseMessage = findMessage(alice.messages, 'api_response');
        const errorMessage = findMessage(alice.messages, 'api_error');
        
        if (responseMessage) {
          successCount++;
        }
        if (errorMessage) {
          errorCount++;
        }
      }
      
      // Should have both successes and errors
      expect(successCount).toBeGreaterThan(0);
      expect(errorCount).toBeGreaterThan(0);
      expect(successCount + errorCount).toBe(requests.length);
    });
  });

  describe('🎨 User Experience Workflows', () => {
    test('should provide consistent kid-friendly experience throughout', async () => {
      const alice = await createTestWebSocketClient(mockServer.url);
      clients.push(alice);
      
      // All messages should be kid-friendly
      const messageChecks = [];
      
      // Connection
      await waitFor(100);
      const welcomeMessage = findMessage(alice.messages, 'connection_established');
      messageChecks.push({
        type: 'welcome',
        message: welcomeMessage?.parsed?.message,
        hasEmoji: /[🎉✨🌟⭐]/.test(welcomeMessage?.parsed?.message || '')
      });
      
      // Name setting
      alice.send(messageBuilders.setUserName('Alice'));
      await waitFor(100);
      
      const nameMessage = findMessage(alice.messages, 'name_updated');
      messageChecks.push({
        type: 'name_update',
        message: nameMessage?.parsed?.message,
        hasEmoji: /[✅🎯👍]/.test(nameMessage?.parsed?.message || '')
      });
      
      // Collection creation
      alice.send(messageBuilders.createCollection('Test Collection'));
      await waitFor(100);
      
      const collectionMessage = findMessage(alice.messages, 'collection_created');
      messageChecks.push({
        type: 'collection_created',
        message: collectionMessage?.parsed?.message,
        hasEmoji: /[🎯📁✨]/.test(collectionMessage?.parsed?.message || '')
      });
      
      // API success
      alice.send(messageBuilders.executeApiRequest(
        testDataGenerators.apiRequest({
          method: 'GET',
          url: 'https://jsonplaceholder.typicode.com/posts/1'
        })
      ));
      await waitFor(1000);
      
      const apiMessage = findMessage(alice.messages, 'api_response');
      messageChecks.push({
        type: 'api_success',
        message: apiMessage?.parsed?.message,
        hasEmoji: /[✅🎉👍]/.test(apiMessage?.parsed?.message || '')
      });
      
      // API error
      alice.send(messageBuilders.executeApiRequest(
        testDataGenerators.apiRequest({
          method: 'GET',
          url: 'https://invalid-domain-12345.com/api'
        })
      ));
      await waitFor(2000);
      
      const errorMessage = findMessage(alice.messages, 'api_error');
      messageChecks.push({
        type: 'api_error',
        message: errorMessage?.parsed?.message,
        hasEmoji: /[❌😅🤔]/.test(errorMessage?.parsed?.message || '')
      });
      
      // Verify all messages are kid-friendly
      messageChecks.forEach(check => {
        expect(check.message).toBeDefined();
        expect(check.hasEmoji).toBe(true);
        expect(check.message?.length).toBeGreaterThan(0);
      });
    });

    test('should maintain responsive real-time updates', async () => {
      const alice = await createTestWebSocketClient(mockServer.url);
      const bob = await createTestWebSocketClient(mockServer.url);
      clients.push(alice, bob);
      
      alice.send(messageBuilders.setUserName('Alice'));
      bob.send(messageBuilders.setUserName('Bob'));
      
      await waitFor(100);
      
      // Track response times for real-time updates
      const startTime = Date.now();
      
      alice.send(messageBuilders.createCollection('Real-time Test'));
      
      // Bob should receive notification quickly
      await waitFor(200);
      
      const notificationTime = Date.now();
      const responseTime = notificationTime - startTime;
      
      const newCollectionMessage = findMessage(bob.messages, 'new_collection_available');
      expect(newCollectionMessage).toBeDefined();
      expect(responseTime).toBeLessThan(1000); // Should be under 1 second
      
      // Test rapid updates
      const rapidStartTime = Date.now();
      
      alice.send({ type: 'ping' });
      await waitFor(100);
      
      const pongMessage = findMessage(alice.messages, 'pong');
      const rapidResponseTime = Date.now() - rapidStartTime;
      
      expect(pongMessage).toBeDefined();
      expect(rapidResponseTime).toBeLessThan(500); // Should be very fast
    });
  });
});

console.log('✅ Complete user workflows E2E tests loaded! Ready to test the full journey! 🎯🚀');
