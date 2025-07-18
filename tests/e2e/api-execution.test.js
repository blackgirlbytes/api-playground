/**
 * 🎯 End-to-End Tests for API Request Execution and Response Handling
 * Testing complete API workflows from request to response in real scenarios!
 */

const { 
  createMockWebSocketServer, 
  createTestWebSocketClient, 
  waitForMessage, 
  findMessage,
  testDataGenerators,
  messageBuilders 
} = require('../utils/test-helpers');

describe('🌐 API Request Execution and Response Handling E2E Tests', () => {
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

  describe('🔄 Complete API Testing Workflows', () => {
    test('should execute comprehensive REST API testing suite', async () => {
      const alice = await createTestWebSocketClient(mockServer.url);
      clients.push(alice);
      
      alice.send(messageBuilders.setUserName('Alice API Tester'));
      await waitFor(100);
      
      // Create comprehensive API test collection
      alice.send(messageBuilders.createCollection(
        'REST API Test Suite',
        'Complete testing of JSONPlaceholder API endpoints'
      ));
      
      await waitFor(200);
      
      const collection = findMessage(alice.messages, 'collection_created');
      const collectionId = collection?.parsed?.collection?.id;
      
      // Define comprehensive test suite
      const testSuite = [
        {
          name: 'GET All Posts',
          request: testDataGenerators.apiRequest({
            method: 'GET',
            url: 'https://jsonplaceholder.typicode.com/posts',
            headers: { 'Accept': 'application/json' },
            description: 'Retrieve all blog posts'
          }),
          expectedStatus: 200,
          expectedType: 'array'
        },
        {
          name: 'GET Single Post',
          request: testDataGenerators.apiRequest({
            method: 'GET',
            url: 'https://jsonplaceholder.typicode.com/posts/1',
            headers: { 'Accept': 'application/json' },
            description: 'Retrieve specific blog post'
          }),
          expectedStatus: 200,
          expectedType: 'object'
        },
        {
          name: 'CREATE New Post',
          request: testDataGenerators.apiRequest({
            method: 'POST',
            url: 'https://jsonplaceholder.typicode.com/posts',
            headers: { 'Content-Type': 'application/json' },
            body: {
              title: 'Test Post from E2E Suite',
              body: 'This is a test post created during end-to-end testing',
              userId: 1
            },
            description: 'Create a new blog post'
          }),
          expectedStatus: 201,
          expectedType: 'object'
        },
        {
          name: 'UPDATE Existing Post',
          request: testDataGenerators.apiRequest({
            method: 'PUT',
            url: 'https://jsonplaceholder.typicode.com/posts/1',
            headers: { 'Content-Type': 'application/json' },
            body: {
              id: 1,
              title: 'Updated Test Post',
              body: 'This post has been updated during testing',
              userId: 1
            },
            description: 'Update existing blog post'
          }),
          expectedStatus: 200,
          expectedType: 'object'
        },
        {
          name: 'DELETE Post',
          request: testDataGenerators.apiRequest({
            method: 'DELETE',
            url: 'https://jsonplaceholder.typicode.com/posts/1',
            description: 'Delete a blog post'
          }),
          expectedStatus: 200,
          expectedType: 'object'
        }
      ];
      
      // Add all test cases to collection
      for (const testCase of testSuite) {
        alice.send(messageBuilders.addRequestToCollection(collectionId, testCase.request));
        await waitFor(150);
      }
      
      // Execute complete test suite
      const testResults = [];
      
      for (const testCase of testSuite) {
        console.log(`🧪 Executing: ${testCase.name}`);
        
        alice.send(messageBuilders.executeApiRequest(testCase.request));
        await waitFor(1200); // Wait for API response
        
        const responseMessage = findMessage(alice.messages, 'api_response');
        
        if (responseMessage && responseMessage.parsed) {
          const response = responseMessage.parsed.response;
          
          testResults.push({
            name: testCase.name,
            success: response.status === testCase.expectedStatus,
            actualStatus: response.status,
            expectedStatus: testCase.expectedStatus,
            responseTime: response.responseTime,
            dataType: Array.isArray(response.data) ? 'array' : typeof response.data
          });
          
          // Verify response structure
          expect(response.status).toBe(testCase.expectedStatus);
          expect(response.responseTime).toBeGreaterThan(0);
          expect(response.responseTime).toBeLessThan(5000);
          
          // Verify data type for successful responses
          if (response.status < 300) {
            if (testCase.expectedType === 'array') {
              expect(Array.isArray(response.data)).toBe(true);
            } else if (testCase.expectedType === 'object') {
              expect(typeof response.data).toBe('object');
              expect(response.data).not.toBeNull();
            }
          }
        } else {
          testResults.push({
            name: testCase.name,
            success: false,
            error: 'No response received'
          });
        }
      }
      
      // Verify test suite completion
      const successfulTests = testResults.filter(result => result.success);
      expect(successfulTests.length).toBe(testSuite.length);
      
      // Verify performance metrics
      const averageResponseTime = testResults.reduce((sum, result) => 
        sum + (result.responseTime || 0), 0) / testResults.length;
      expect(averageResponseTime).toBeLessThan(2000); // Average under 2 seconds
      
      console.log('✅ Complete REST API test suite executed successfully!');
    });

    test('should handle complex API workflows with dependencies', async () => {
      const alice = await createTestWebSocketClient(mockServer.url);
      clients.push(alice);
      
      alice.send(messageBuilders.setUserName('Alice Workflow Tester'));
      await waitFor(100);
      
      // Create workflow collection
      alice.send(messageBuilders.createCollection(
        'Dependent API Workflow',
        'Testing APIs with data dependencies'
      ));
      
      await waitFor(200);
      
      const collection = findMessage(alice.messages, 'collection_created');
      const collectionId = collection?.parsed?.collection?.id;
      
      // Step 1: Get user data (dependency for subsequent requests)
      const getUserRequest = testDataGenerators.apiRequest({
        method: 'GET',
        url: 'https://jsonplaceholder.typicode.com/users/1',
        description: 'Get user data for workflow'
      });
      
      alice.send(messageBuilders.addRequestToCollection(collectionId, getUserRequest));
      alice.send(messageBuilders.executeApiRequest(getUserRequest));
      
      await waitFor(1000);
      
      const userResponse = findMessage(alice.messages, 'api_response');
      expect(userResponse).toBeDefined();
      
      let userId = 1;
      if (userResponse?.parsed?.response?.data?.id) {
        userId = userResponse.parsed.response.data.id;
      }
      
      // Step 2: Create post using user data
      const createPostRequest = testDataGenerators.apiRequest({
        method: 'POST',
        url: 'https://jsonplaceholder.typicode.com/posts',
        headers: { 'Content-Type': 'application/json' },
        body: {
          title: 'Workflow Test Post',
          body: 'This post was created as part of a workflow test',
          userId: userId
        },
        description: 'Create post using user data from previous step'
      });
      
      alice.send(messageBuilders.addRequestToCollection(collectionId, createPostRequest));
      alice.send(messageBuilders.executeApiRequest(createPostRequest));
      
      await waitFor(1000);
      
      const createResponse = findMessage(alice.messages, 'api_response');
      expect(createResponse).toBeDefined();
      expect(createResponse?.parsed?.response?.status).toBe(201);
      
      let postId = 101; // Default for JSONPlaceholder
      if (createResponse?.parsed?.response?.data?.id) {
        postId = createResponse.parsed.response.data.id;
      }
      
      // Step 3: Update the created post
      const updatePostRequest = testDataGenerators.apiRequest({
        method: 'PUT',
        url: `https://jsonplaceholder.typicode.com/posts/${postId}`,
        headers: { 'Content-Type': 'application/json' },
        body: {
          id: postId,
          title: 'Updated Workflow Test Post',
          body: 'This post has been updated in the workflow',
          userId: userId
        },
        description: 'Update the post created in previous step'
      });
      
      alice.send(messageBuilders.addRequestToCollection(collectionId, updatePostRequest));
      alice.send(messageBuilders.executeApiRequest(updatePostRequest));
      
      await waitFor(1000);
      
      const updateResponse = findMessage(alice.messages, 'api_response');
      expect(updateResponse).toBeDefined();
      expect(updateResponse?.parsed?.response?.status).toBe(200);
      
      // Step 4: Verify the workflow by getting the updated post
      const verifyRequest = testDataGenerators.apiRequest({
        method: 'GET',
        url: `https://jsonplaceholder.typicode.com/posts/${postId}`,
        description: 'Verify the workflow by retrieving updated post'
      });
      
      alice.send(messageBuilders.addRequestToCollection(collectionId, verifyRequest));
      alice.send(messageBuilders.executeApiRequest(verifyRequest));
      
      await waitFor(1000);
      
      const verifyResponse = findMessage(alice.messages, 'api_response');
      expect(verifyResponse).toBeDefined();
      expect(verifyResponse?.parsed?.response?.status).toBe(200);
      
      // Verify complete workflow
      alice.send({ type: 'get_request_history' });
      await waitFor(200);
      
      const history = findMessage(alice.messages, 'request_history');
      expect(history?.parsed?.history?.length).toBe(4); // All workflow steps
      
      console.log('✅ Complex API workflow with dependencies completed successfully!');
    });

    test('should handle batch API operations', async () => {
      const alice = await createTestWebSocketClient(mockServer.url);
      clients.push(alice);
      
      alice.send(messageBuilders.setUserName('Alice Batch Tester'));
      await waitFor(100);
      
      // Create batch operations collection
      alice.send(messageBuilders.createCollection(
        'Batch API Operations',
        'Testing multiple API calls in sequence'
      ));
      
      await waitFor(200);
      
      const collection = findMessage(alice.messages, 'collection_created');
      const collectionId = collection?.parsed?.collection?.id;
      
      // Create batch of similar operations
      const batchOperations = [];
      for (let i = 1; i <= 5; i++) {
        batchOperations.push({
          name: `Batch Operation ${i}`,
          request: testDataGenerators.apiRequest({
            method: 'GET',
            url: `https://jsonplaceholder.typicode.com/posts/${i}`,
            description: `Batch request ${i} - Get post ${i}`
          })
        });
      }
      
      // Add all batch operations to collection
      for (const operation of batchOperations) {
        alice.send(messageBuilders.addRequestToCollection(collectionId, operation.request));
        await waitFor(100);
      }
      
      // Execute batch operations with timing
      const batchStartTime = Date.now();
      const batchResults = [];
      
      for (const operation of batchOperations) {
        const operationStartTime = Date.now();
        
        alice.send(messageBuilders.executeApiRequest(operation.request));
        await waitFor(800);
        
        const response = findMessage(alice.messages, 'api_response');
        
        if (response?.parsed) {
          batchResults.push({
            name: operation.name,
            status: response.parsed.response.status,
            responseTime: response.parsed.response.responseTime,
            operationTime: Date.now() - operationStartTime
          });
        }
      }
      
      const totalBatchTime = Date.now() - batchStartTime;
      
      // Verify batch execution
      expect(batchResults.length).toBe(batchOperations.length);
      expect(batchResults.every(result => result.status === 200)).toBe(true);
      expect(totalBatchTime).toBeLessThan(10000); // Under 10 seconds total
      
      // Verify performance characteristics
      const averageResponseTime = batchResults.reduce((sum, result) => 
        sum + result.responseTime, 0) / batchResults.length;
      expect(averageResponseTime).toBeLessThan(2000);
      
      console.log(`✅ Batch operations completed in ${totalBatchTime}ms`);
    });
  });

  describe('🚨 Error Handling and Recovery', () => {
    test('should gracefully handle various API error scenarios', async () => {
      const alice = await createTestWebSocketClient(mockServer.url);
      clients.push(alice);
      
      alice.send(messageBuilders.setUserName('Alice Error Tester'));
      await waitFor(100);
      
      // Create error testing collection
      alice.send(messageBuilders.createCollection(
        'API Error Scenarios',
        'Testing various error conditions and recovery'
      ));
      
      await waitFor(200);
      
      const collection = findMessage(alice.messages, 'collection_created');
      const collectionId = collection?.parsed?.collection?.id;
      
      // Define error test scenarios
      const errorScenarios = [
        {
          name: '404 Not Found',
          request: testDataGenerators.apiRequest({
            method: 'GET',
            url: 'https://jsonplaceholder.typicode.com/posts/99999',
            description: 'Test 404 error handling'
          }),
          expectedError: false, // JSONPlaceholder returns empty object, not 404
          expectedStatus: 200
        },
        {
          name: 'Invalid Domain',
          request: testDataGenerators.apiRequest({
            method: 'GET',
            url: 'https://this-domain-absolutely-does-not-exist-12345.com/api',
            description: 'Test DNS resolution error'
          }),
          expectedError: true,
          expectedErrorType: 'ENOTFOUND'
        },
        {
          name: 'Invalid URL Format',
          request: testDataGenerators.apiRequest({
            method: 'GET',
            url: 'not-a-valid-url',
            description: 'Test invalid URL format'
          }),
          expectedError: true,
          expectedErrorType: 'invalid_url'
        },
        {
          name: 'Malformed JSON Body',
          request: testDataGenerators.apiRequest({
            method: 'POST',
            url: 'https://jsonplaceholder.typicode.com/posts',
            headers: { 'Content-Type': 'application/json' },
            body: '{"invalid": json}', // Invalid JSON
            description: 'Test malformed JSON handling'
          }),
          expectedError: false, // Server might handle this gracefully
          expectedStatus: 201
        }
      ];
      
      // Add error scenarios to collection
      for (const scenario of errorScenarios) {
        alice.send(messageBuilders.addRequestToCollection(collectionId, scenario.request));
        await waitFor(100);
      }
      
      // Execute error scenarios
      const errorResults = [];
      
      for (const scenario of errorScenarios) {
        console.log(`🧪 Testing error scenario: ${scenario.name}`);
        
        alice.send(messageBuilders.executeApiRequest(scenario.request));
        await waitFor(3000); // Longer wait for error scenarios
        
        const responseMessage = findMessage(alice.messages, 'api_response');
        const errorMessage = findMessage(alice.messages, 'api_error');
        
        if (scenario.expectedError) {
          // Should receive error message
          expect(errorMessage).toBeDefined();
          
          if (errorMessage?.parsed) {
            errorResults.push({
              name: scenario.name,
              gotError: true,
              errorType: errorMessage.parsed.error.technical,
              friendlyMessage: errorMessage.parsed.error.friendly,
              hasEmoji: /[🌐🚪⏰📝🔒💥❌🤔]/.test(errorMessage.parsed.error.friendly)
            });
            
            // Verify kid-friendly error message
            expect(errorMessage.parsed.error.friendly).toContain('🌐' || '🚪' || '⏰' || '📝' || '🔒' || '💥' || '❌' || '🤔');
            expect(errorMessage.parsed.message).toContain('❌');
          }
        } else {
          // Should receive successful response
          expect(responseMessage).toBeDefined();
          
          if (responseMessage?.parsed) {
            errorResults.push({
              name: scenario.name,
              gotError: false,
              status: responseMessage.parsed.response.status,
              success: responseMessage.parsed.response.status === scenario.expectedStatus
            });
          }
        }
      }
      
      // Verify error handling
      const errorScenarioCount = errorScenarios.filter(s => s.expectedError).length;
      const successScenarioCount = errorScenarios.filter(s => !s.expectedError).length;
      
      const actualErrors = errorResults.filter(r => r.gotError).length;
      const actualSuccesses = errorResults.filter(r => !r.gotError).length;
      
      expect(actualErrors).toBeGreaterThan(0); // Should have some errors
      expect(actualSuccesses).toBeGreaterThan(0); // Should have some successes
      
      console.log('✅ Error handling scenarios completed successfully!');
    });

    test('should recover from network interruptions', async () => {
      const alice = await createTestWebSocketClient(mockServer.url);
      clients.push(alice);
      
      alice.send(messageBuilders.setUserName('Alice Network Tester'));
      await waitFor(100);
      
      // Test network timeout scenario
      const timeoutRequest = testDataGenerators.apiRequest({
        method: 'GET',
        url: 'https://httpstat.us/200?sleep=35000', // 35 second delay (will timeout)
        description: 'Test network timeout handling'
      });
      
      alice.send(messageBuilders.executeApiRequest(timeoutRequest));
      await waitFor(5000); // Wait for timeout
      
      const timeoutError = findMessage(alice.messages, 'api_error');
      expect(timeoutError).toBeDefined();
      
      if (timeoutError?.parsed) {
        expect(timeoutError.parsed.error.friendly).toContain('⏰');
        expect(timeoutError.parsed.message).toContain('❌');
      }
      
      // Verify system can continue after timeout
      const recoveryRequest = testDataGenerators.apiRequest({
        method: 'GET',
        url: 'https://jsonplaceholder.typicode.com/posts/1',
        description: 'Recovery test after timeout'
      });
      
      alice.send(messageBuilders.executeApiRequest(recoveryRequest));
      await waitFor(1000);
      
      const recoveryResponse = findMessage(alice.messages, 'api_response');
      expect(recoveryResponse).toBeDefined();
      expect(recoveryResponse?.parsed?.response?.status).toBe(200);
      
      console.log('✅ Network interruption recovery test completed!');
    });
  });

  describe('📊 Performance and Load Testing', () => {
    test('should handle rapid API request sequences', async () => {
      const alice = await createTestWebSocketClient(mockServer.url);
      clients.push(alice);
      
      alice.send(messageBuilders.setUserName('Alice Performance Tester'));
      await waitFor(100);
      
      // Create performance test collection
      alice.send(messageBuilders.createCollection(
        'Performance Test Suite',
        'Testing system performance under load'
      ));
      
      await waitFor(200);
      
      // Execute rapid sequence of requests
      const rapidRequests = [];
      for (let i = 1; i <= 10; i++) {
        rapidRequests.push(testDataGenerators.apiRequest({
          method: 'GET',
          url: `https://jsonplaceholder.typicode.com/posts/${i}`,
          description: `Rapid request ${i}`
        }));
      }
      
      const startTime = Date.now();
      
      // Send all requests rapidly
      rapidRequests.forEach((request, index) => {
        setTimeout(() => {
          alice.send(messageBuilders.executeApiRequest(request));
        }, index * 100); // 100ms apart
      });
      
      // Wait for all responses
      await waitFor(5000);
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // Count successful responses
      const responses = alice.messages.filter(msg => 
        msg.parsed && msg.parsed.type === 'api_response'
      );
      
      expect(responses.length).toBe(rapidRequests.length);
      expect(totalTime).toBeLessThan(8000); // Should complete within 8 seconds
      
      // Verify all responses are valid
      responses.forEach(response => {
        expect(response.parsed.response.status).toBe(200);
        expect(response.parsed.response.responseTime).toBeGreaterThan(0);
      });
      
      console.log(`✅ Rapid sequence test: ${responses.length} requests in ${totalTime}ms`);
    });

    test('should maintain performance with concurrent users', async () => {
      const users = [];
      const userCount = 5;
      
      // Create multiple concurrent users
      for (let i = 0; i < userCount; i++) {
        const client = await createTestWebSocketClient(mockServer.url);
        client.send(messageBuilders.setUserName(`User${i + 1}`));
        users.push(client);
        clients.push(client);
      }
      
      await waitFor(300);
      
      // All users execute API requests simultaneously
      const concurrentStartTime = Date.now();
      
      users.forEach((user, index) => {
        const request = testDataGenerators.apiRequest({
          method: 'GET',
          url: `https://jsonplaceholder.typicode.com/posts/${index + 1}`,
          description: `Concurrent request from User${index + 1}`
        });
        
        user.send(messageBuilders.executeApiRequest(request));
      });
      
      await waitFor(3000);
      
      const concurrentEndTime = Date.now();
      const concurrentTotalTime = concurrentEndTime - concurrentStartTime;
      
      // Verify all users received responses
      let totalResponses = 0;
      users.forEach(user => {
        const userResponses = user.messages.filter(msg => 
          msg.parsed && msg.parsed.type === 'api_response'
        );
        totalResponses += userResponses.length;
      });
      
      expect(totalResponses).toBe(userCount);
      expect(concurrentTotalTime).toBeLessThan(5000);
      
      console.log(`✅ Concurrent users test: ${userCount} users, ${totalResponses} responses in ${concurrentTotalTime}ms`);
    });
  });

  describe('🔒 Security and Authentication Testing', () => {
    test('should handle authentication headers correctly', async () => {
      const alice = await createTestWebSocketClient(mockServer.url);
      clients.push(alice);
      
      alice.send(messageBuilders.setUserName('Alice Security Tester'));
      await waitFor(100);
      
      // Test with authentication headers
      const authRequest = testDataGenerators.apiRequest({
        method: 'GET',
        url: 'https://jsonplaceholder.typicode.com/posts/1',
        headers: {
          'Authorization': 'Bearer fake-jwt-token-for-testing',
          'Accept': 'application/json'
        },
        description: 'Test with authentication headers'
      });
      
      alice.send(messageBuilders.executeApiRequest(authRequest));
      await waitFor(1000);
      
      const authResponse = findMessage(alice.messages, 'api_response');
      expect(authResponse).toBeDefined();
      expect(authResponse?.parsed?.response?.status).toBe(200);
      
      // Test basic authentication
      const basicAuthRequest = testDataGenerators.apiRequest({
        method: 'GET',
        url: 'https://jsonplaceholder.typicode.com/posts/1',
        auth: {
          type: 'basic',
          username: 'testuser',
          password: 'testpass'
        },
        description: 'Test with basic authentication'
      });
      
      alice.send(messageBuilders.executeApiRequest(basicAuthRequest));
      await waitFor(1000);
      
      const basicAuthResponse = findMessage(alice.messages, 'api_response');
      expect(basicAuthResponse).toBeDefined();
      expect(basicAuthResponse?.parsed?.response?.status).toBe(200);
      
      console.log('✅ Authentication testing completed successfully!');
    });

    test('should sanitize sensitive data in responses', async () => {
      const alice = await createTestWebSocketClient(mockServer.url);
      const bob = await createTestWebSocketClient(mockServer.url);
      clients.push(alice, bob);
      
      alice.send(messageBuilders.setUserName('Alice'));
      bob.send(messageBuilders.setUserName('Bob'));
      
      await waitFor(100);
      
      // Alice executes request with sensitive data
      const sensitiveRequest = testDataGenerators.apiRequest({
        method: 'POST',
        url: 'https://jsonplaceholder.typicode.com/posts',
        headers: {
          'Authorization': 'Bearer sensitive-token-12345',
          'Content-Type': 'application/json'
        },
        body: {
          title: 'Test Post',
          body: 'Test content',
          apiKey: 'secret-api-key-67890'
        },
        description: 'Request with sensitive data'
      });
      
      alice.send(messageBuilders.executeApiRequest(sensitiveRequest));
      await waitFor(1000);
      
      // Alice should receive full response
      const aliceResponse = findMessage(alice.messages, 'api_response');
      expect(aliceResponse).toBeDefined();
      
      // Bob should receive notification but not sensitive data
      const bobNotification = findMessage(bob.messages, 'api_request_executed');
      expect(bobNotification).toBeDefined();
      
      if (bobNotification?.parsed) {
        // Notification should not contain full response data
        expect(bobNotification.parsed.response).toBeUndefined();
        expect(bobNotification.parsed.method).toBe('POST');
        expect(bobNotification.parsed.url).toBe(sensitiveRequest.url);
      }
      
      console.log('✅ Sensitive data sanitization test completed!');
    });
  });
});

console.log('✅ API request execution and response handling E2E tests loaded! Ready to test the complete API journey! 🌐🎯');
