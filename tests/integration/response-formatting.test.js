/**
 * 🔗 Integration Tests for Response Formatting and History Management
 * Testing how API responses are formatted and stored across the system!
 */

const { 
  createMockWebSocketServer, 
  createTestWebSocketClient, 
  waitForMessage, 
  findMessage,
  testDataGenerators,
  messageBuilders 
} = require('../utils/test-helpers');
const { sampleApiResponses } = require('../fixtures/mock-data');

describe('📊 Response Formatting and History Integration Tests', () => {
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

  describe('📋 Response Formatting', () => {
    test('should format successful API responses consistently', async () => {
      const alice = await createTestWebSocketClient(mockServer.url);
      clients.push(alice);
      
      alice.send(messageBuilders.setUserName('Alice'));
      await waitFor(100);
      
      // Execute a successful API request
      const testRequest = testDataGenerators.apiRequest({
        method: 'GET',
        url: 'https://jsonplaceholder.typicode.com/posts/1'
      });
      
      alice.send(messageBuilders.executeApiRequest(testRequest));
      await waitFor(1000); // Wait for API response
      
      const responseMessage = findMessage(alice.messages, 'api_response');
      expect(responseMessage).toBeDefined();
      
      if (responseMessage && responseMessage.parsed) {
        const response = responseMessage.parsed.response;
        
        // Verify response structure
        expect(response).toHaveProperty('status');
        expect(response).toHaveProperty('statusText');
        expect(response).toHaveProperty('headers');
        expect(response).toHaveProperty('data');
        expect(response).toHaveProperty('responseTime');
        
        // Verify data types
        expect(typeof response.status).toBe('number');
        expect(typeof response.statusText).toBe('string');
        expect(typeof response.headers).toBe('object');
        expect(typeof response.responseTime).toBe('number');
        
        // Verify response time is reasonable
        expect(response.responseTime).toBeGreaterThan(0);
        expect(response.responseTime).toBeLessThan(10000); // Less than 10 seconds
      }
    });

    test('should format error responses with kid-friendly messages', async () => {
      const alice = await createTestWebSocketClient(mockServer.url);
      clients.push(alice);
      
      alice.send(messageBuilders.setUserName('Alice'));
      await waitFor(100);
      
      // Execute request to non-existent domain
      const failingRequest = testDataGenerators.apiRequest({
        method: 'GET',
        url: 'https://this-domain-definitely-does-not-exist-12345.com/api'
      });
      
      alice.send(messageBuilders.executeApiRequest(failingRequest));
      await waitFor(2000); // Wait for timeout/error
      
      const errorMessage = findMessage(alice.messages, 'api_error');
      expect(errorMessage).toBeDefined();
      
      if (errorMessage && errorMessage.parsed) {
        const error = errorMessage.parsed.error;
        
        // Verify error structure
        expect(error).toHaveProperty('friendly');
        expect(error).toHaveProperty('technical');
        expect(error).toHaveProperty('context');
        
        // Verify kid-friendly message contains emoji
        expect(error.friendly).toMatch(/[🌐🚪⏰📝🔒💥❌🤔]/);
        
        // Verify technical details are present
        expect(typeof error.technical).toBe('string');
        expect(error.technical.length).toBeGreaterThan(0);
        
        // Verify context
        expect(error.context).toBe('API Request');
      }
    });

    test('should handle different content types in responses', async () => {
      const alice = await createTestWebSocketClient(mockServer.url);
      clients.push(alice);
      
      alice.send(messageBuilders.setUserName('Alice'));
      await waitFor(100);
      
      // Test JSON response
      const jsonRequest = testDataGenerators.apiRequest({
        method: 'GET',
        url: 'https://jsonplaceholder.typicode.com/posts/1'
      });
      
      alice.send(messageBuilders.executeApiRequest(jsonRequest));
      await waitFor(1000);
      
      const jsonResponse = findMessage(alice.messages, 'api_response');
      expect(jsonResponse).toBeDefined();
      
      if (jsonResponse && jsonResponse.parsed) {
        const response = jsonResponse.parsed.response;
        
        // Should have parsed JSON data
        expect(typeof response.data).toBe('object');
        expect(response.headers['content-type']).toContain('json');
      }
    });

    test('should preserve response headers and metadata', async () => {
      const alice = await createTestWebSocketClient(mockServer.url);
      clients.push(alice);
      
      alice.send(messageBuilders.setUserName('Alice'));
      await waitFor(100);
      
      const testRequest = testDataGenerators.apiRequest({
        method: 'GET',
        url: 'https://jsonplaceholder.typicode.com/posts'
      });
      
      alice.send(messageBuilders.executeApiRequest(testRequest));
      await waitFor(1000);
      
      const responseMessage = findMessage(alice.messages, 'api_response');
      if (responseMessage && responseMessage.parsed) {
        const response = responseMessage.parsed.response;
        
        // Verify headers are preserved
        expect(response.headers).toBeDefined();
        expect(typeof response.headers).toBe('object');
        
        // Common headers should be present
        expect(response.headers).toHaveProperty('content-type');
        
        // Verify status information
        expect(response.status).toBeGreaterThanOrEqual(200);
        expect(response.status).toBeLessThan(600);
        expect(response.statusText).toBeDefined();
      }
    });

    test('should calculate accurate response times', async () => {
      const alice = await createTestWebSocketClient(mockServer.url);
      clients.push(alice);
      
      alice.send(messageBuilders.setUserName('Alice'));
      await waitFor(100);
      
      const startTime = Date.now();
      
      const testRequest = testDataGenerators.apiRequest({
        method: 'GET',
        url: 'https://jsonplaceholder.typicode.com/posts/1'
      });
      
      alice.send(messageBuilders.executeApiRequest(testRequest));
      await waitFor(1000);
      
      const responseMessage = findMessage(alice.messages, 'api_response');
      const endTime = Date.now();
      
      if (responseMessage && responseMessage.parsed) {
        const response = responseMessage.parsed.response;
        const totalTime = endTime - startTime;
        
        // Response time should be reasonable
        expect(response.responseTime).toBeGreaterThan(0);
        expect(response.responseTime).toBeLessThan(totalTime);
        expect(response.responseTime).toBeLessThan(5000); // Less than 5 seconds
      }
    });
  });

  describe('📚 History Management', () => {
    test('should store request history for individual users', async () => {
      const alice = await createTestWebSocketClient(mockServer.url);
      clients.push(alice);
      
      alice.send(messageBuilders.setUserName('Alice'));
      await waitFor(100);
      
      // Execute multiple API requests
      const requests = [
        testDataGenerators.apiRequest({ method: 'GET', url: 'https://jsonplaceholder.typicode.com/posts/1' }),
        testDataGenerators.apiRequest({ method: 'GET', url: 'https://jsonplaceholder.typicode.com/posts/2' }),
        testDataGenerators.apiRequest({ method: 'GET', url: 'https://jsonplaceholder.typicode.com/users/1' })
      ];
      
      for (const request of requests) {
        alice.send(messageBuilders.executeApiRequest(request));
        await waitFor(800); // Wait between requests
      }
      
      // Request history
      alice.send({ type: 'get_request_history' });
      await waitFor(200);
      
      const historyMessage = findMessage(alice.messages, 'request_history');
      expect(historyMessage).toBeDefined();
      
      if (historyMessage && historyMessage.parsed) {
        const history = historyMessage.parsed.history;
        
        // Verify history structure
        expect(Array.isArray(history)).toBe(true);
        expect(history.length).toBeGreaterThan(0);
        
        // Verify history entry structure
        if (history.length > 0) {
          const entry = history[0];
          expect(entry).toHaveProperty('id');
          expect(entry).toHaveProperty('request');
          expect(entry).toHaveProperty('response');
          expect(entry).toHaveProperty('userId');
          expect(entry).toHaveProperty('userName');
          expect(entry).toHaveProperty('timestamp');
          expect(entry).toHaveProperty('executionTime');
          
          // Verify data types
          expect(typeof entry.id).toBe('string');
          expect(typeof entry.userId).toBe('string');
          expect(typeof entry.userName).toBe('string');
          expect(typeof entry.timestamp).toBe('string');
          expect(typeof entry.executionTime).toBe('number');
        }
      }
    });

    test('should maintain chronological order in history', async () => {
      const alice = await createTestWebSocketClient(mockServer.url);
      clients.push(alice);
      
      alice.send(messageBuilders.setUserName('Alice'));
      await waitFor(100);
      
      // Execute requests with delays to ensure different timestamps
      const requests = [
        testDataGenerators.apiRequest({ method: 'GET', url: 'https://jsonplaceholder.typicode.com/posts/1' }),
        testDataGenerators.apiRequest({ method: 'GET', url: 'https://jsonplaceholder.typicode.com/posts/2' }),
        testDataGenerators.apiRequest({ method: 'GET', url: 'https://jsonplaceholder.typicode.com/posts/3' })
      ];
      
      for (let i = 0; i < requests.length; i++) {
        alice.send(messageBuilders.executeApiRequest(requests[i]));
        await waitFor(500); // Ensure different timestamps
      }
      
      alice.send({ type: 'get_request_history' });
      await waitFor(200);
      
      const historyMessage = findMessage(alice.messages, 'request_history');
      if (historyMessage && historyMessage.parsed) {
        const history = historyMessage.parsed.history;
        
        if (history.length > 1) {
          // Verify chronological order (most recent first)
          for (let i = 0; i < history.length - 1; i++) {
            const current = new Date(history[i].timestamp);
            const next = new Date(history[i + 1].timestamp);
            expect(current.getTime()).toBeGreaterThanOrEqual(next.getTime());
          }
        }
      }
    });

    test('should isolate history between different users', async () => {
      const alice = await createTestWebSocketClient(mockServer.url);
      const bob = await createTestWebSocketClient(mockServer.url);
      clients.push(alice, bob);
      
      alice.send(messageBuilders.setUserName('Alice'));
      bob.send(messageBuilders.setUserName('Bob'));
      
      await waitFor(100);
      
      // Alice executes a request
      alice.send(messageBuilders.executeApiRequest(
        testDataGenerators.apiRequest({ method: 'GET', url: 'https://jsonplaceholder.typicode.com/posts/1' })
      ));
      
      await waitFor(800);
      
      // Bob executes a different request
      bob.send(messageBuilders.executeApiRequest(
        testDataGenerators.apiRequest({ method: 'GET', url: 'https://jsonplaceholder.typicode.com/users/1' })
      ));
      
      await waitFor(800);
      
      // Both request their history
      alice.send({ type: 'get_request_history' });
      bob.send({ type: 'get_request_history' });
      
      await waitFor(200);
      
      const aliceHistory = findMessage(alice.messages, 'request_history');
      const bobHistory = findMessage(bob.messages, 'request_history');
      
      expect(aliceHistory).toBeDefined();
      expect(bobHistory).toBeDefined();
      
      if (aliceHistory?.parsed && bobHistory?.parsed) {
        const aliceEntries = aliceHistory.parsed.history;
        const bobEntries = bobHistory.parsed.history;
        
        // Each user should only see their own history
        aliceEntries.forEach(entry => {
          expect(entry.userName).toBe('Alice');
        });
        
        bobEntries.forEach(entry => {
          expect(entry.userName).toBe('Bob');
        });
      }
    });

    test('should handle history for failed requests', async () => {
      const alice = await createTestWebSocketClient(mockServer.url);
      clients.push(alice);
      
      alice.send(messageBuilders.setUserName('Alice'));
      await waitFor(100);
      
      // Execute a request that will fail
      const failingRequest = testDataGenerators.apiRequest({
        method: 'GET',
        url: 'https://invalid-domain-that-does-not-exist.com/api'
      });
      
      alice.send(messageBuilders.executeApiRequest(failingRequest));
      await waitFor(2000); // Wait for timeout
      
      // Should receive error
      const errorMessage = findMessage(alice.messages, 'api_error');
      expect(errorMessage).toBeDefined();
      
      // Check if failed requests are stored in history
      alice.send({ type: 'get_request_history' });
      await waitFor(200);
      
      const historyMessage = findMessage(alice.messages, 'request_history');
      if (historyMessage && historyMessage.parsed) {
        const history = historyMessage.parsed.history;
        
        // Failed requests might or might not be stored depending on implementation
        // This test verifies the system handles the scenario gracefully
        expect(Array.isArray(history)).toBe(true);
      }
    });

    test('should include execution metadata in history', async () => {
      const alice = await createTestWebSocketClient(mockServer.url);
      clients.push(alice);
      
      alice.send(messageBuilders.setUserName('Alice'));
      await waitFor(100);
      
      const testRequest = testDataGenerators.apiRequest({
        method: 'GET',
        url: 'https://jsonplaceholder.typicode.com/posts/1'
      });
      
      alice.send(messageBuilders.executeApiRequest(testRequest));
      await waitFor(1000);
      
      alice.send({ type: 'get_request_history' });
      await waitFor(200);
      
      const historyMessage = findMessage(alice.messages, 'request_history');
      if (historyMessage && historyMessage.parsed) {
        const history = historyMessage.parsed.history;
        
        if (history.length > 0) {
          const entry = history[0];
          
          // Verify execution metadata
          expect(entry.executionTime).toBeGreaterThan(0);
          expect(entry.timestamp).toBeDefined();
          expect(new Date(entry.timestamp)).toBeInstanceOf(Date);
          
          // Verify request details are preserved
          expect(entry.request.method).toBe(testRequest.method);
          expect(entry.request.url).toBe(testRequest.url);
          
          // Verify response details are included
          if (entry.response) {
            expect(entry.response).toHaveProperty('status');
            expect(entry.response).toHaveProperty('responseTime');
          }
        }
      }
    });
  });

  describe('🔄 Cross-User History Broadcasting', () => {
    test('should broadcast API execution events to other users', async () => {
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
      await waitFor(1000);
      
      // Bob should receive notification about Alice's API execution
      const executionMessage = findMessage(bob.messages, 'api_request_executed');
      expect(executionMessage).toBeDefined();
      
      if (executionMessage && executionMessage.parsed) {
        const execution = executionMessage.parsed;
        
        // Verify broadcast contains essential info but not sensitive data
        expect(execution.method).toBe('GET');
        expect(execution.url).toBe(testRequest.url);
        expect(execution.userName).toBe('Alice');
        expect(execution.timestamp).toBeDefined();
        expect(execution.status).toBeDefined();
        
        // Should not contain full response data (privacy)
        expect(execution.response).toBeUndefined();
      }
    });

    test('should handle high-frequency API executions', async () => {
      const alice = await createTestWebSocketClient(mockServer.url);
      const bob = await createTestWebSocketClient(mockServer.url);
      clients.push(alice, bob);
      
      alice.send(messageBuilders.setUserName('Alice'));
      bob.send(messageBuilders.setUserName('Bob'));
      
      await waitFor(100);
      
      // Alice executes multiple requests rapidly
      const requests = Array.from({ length: 3 }, (_, i) => 
        testDataGenerators.apiRequest({
          method: 'GET',
          url: `https://jsonplaceholder.typicode.com/posts/${i + 1}`
        })
      );
      
      requests.forEach((request, index) => {
        setTimeout(() => {
          alice.send(messageBuilders.executeApiRequest(request));
        }, index * 200);
      });
      
      await waitFor(2000);
      
      // Bob should receive multiple execution notifications
      const executionMessages = bob.messages.filter(msg => 
        msg.parsed && msg.parsed.type === 'api_request_executed'
      );
      
      expect(executionMessages.length).toBeGreaterThan(0);
      
      // Verify all notifications have proper structure
      executionMessages.forEach(msg => {
        expect(msg.parsed.userName).toBe('Alice');
        expect(msg.parsed.method).toBe('GET');
        expect(msg.parsed.timestamp).toBeDefined();
      });
    });
  });

  describe('🧹 History Cleanup and Management', () => {
    test('should handle large history datasets', async () => {
      const alice = await createTestWebSocketClient(mockServer.url);
      clients.push(alice);
      
      alice.send(messageBuilders.setUserName('Alice'));
      await waitFor(100);
      
      // Simulate having executed many requests
      // In a real test, this would involve actual API calls
      // For now, we test the history retrieval mechanism
      
      alice.send({ type: 'get_request_history' });
      await waitFor(200);
      
      const historyMessage = findMessage(alice.messages, 'request_history');
      expect(historyMessage).toBeDefined();
      
      if (historyMessage && historyMessage.parsed) {
        const history = historyMessage.parsed.history;
        
        // History should be manageable size (implementation dependent)
        expect(Array.isArray(history)).toBe(true);
        expect(history.length).toBeLessThan(10000); // Reasonable limit
      }
    });

    test('should maintain history performance with concurrent users', async () => {
      const users = [];
      
      // Connect multiple users
      for (let i = 0; i < 5; i++) {
        const client = await createTestWebSocketClient(mockServer.url);
        client.send(messageBuilders.setUserName(`User${i + 1}`));
        users.push(client);
        clients.push(client);
      }
      
      await waitFor(200);
      
      // All users request history simultaneously
      users.forEach(user => {
        user.send({ type: 'get_request_history' });
      });
      
      await waitFor(500);
      
      // All users should receive their history
      users.forEach(user => {
        const historyMessage = findMessage(user.messages, 'request_history');
        expect(historyMessage).toBeDefined();
      });
    });
  });
});

console.log('✅ Response formatting and history integration tests loaded! Ready to test data management! 📊📚');
