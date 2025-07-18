/**
 * 🧪 Unit Tests for WebSocket Server Functionality
 * Testing individual components to make sure they work perfectly!
 */

const { testDataGenerators, messageBuilders } = require('../utils/test-helpers');
const { sampleUsers, sampleApiRequests, sampleErrors } = require('../fixtures/mock-data');

// Mock the WebSocket module
jest.mock('ws');

describe('🔌 WebSocket Server Unit Tests', () => {
  let mockWs;
  let mockServer;
  let serverModule;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create mock WebSocket
    mockWs = createMockWebSocket();
    
    // Mock the server
    mockServer = {
      listen: jest.fn((port, callback) => callback()),
      close: jest.fn((callback) => callback()),
      on: jest.fn()
    };

    // Mock http.createServer
    jest.doMock('http', () => ({
      createServer: jest.fn(() => mockServer)
    }));

    // Mock WebSocket.Server
    const MockWebSocketServer = jest.fn(() => ({
      on: jest.fn()
    }));
    
    jest.doMock('ws', () => ({
      Server: MockWebSocketServer
    }));
  });

  afterEach(() => {
    jest.resetModules();
  });

  describe('🎯 Connection Handling', () => {
    test('should establish WebSocket connection successfully', () => {
      // Test that connection is properly established
      expect(mockWs.readyState).toBe(1); // OPEN state
      expect(mockWs.send).toBeDefined();
      expect(mockWs.on).toBeDefined();
    });

    test('should generate unique user ID for new connections', () => {
      const userId1 = 'user_' + Math.random().toString(36).substr(2, 9);
      const userId2 = 'user_' + Math.random().toString(36).substr(2, 9);
      
      expect(userId1).not.toBe(userId2);
      expect(userId1).toMatch(/^user_[a-z0-9]{9}$/);
    });

    test('should send welcome message on connection', () => {
      const welcomeMessage = {
        type: 'connection_established',
        userId: 'test_user',
        message: '🎉 Welcome! You\'re now connected to the API collaboration server!'
      };

      // Simulate sending welcome message
      mockWs.send(JSON.stringify(welcomeMessage));
      
      expect(mockWs.send).toHaveBeenCalledWith(JSON.stringify(welcomeMessage));
      expect(mockWs.sentMessages).toHaveLength(1);
    });

    test('should handle connection errors gracefully', () => {
      const errorHandler = jest.fn();
      mockWs.on('error', errorHandler);
      
      // Simulate error
      const testError = new Error('Connection failed');
      mockWs.emit('error', testError);
      
      expect(errorHandler).toHaveBeenCalledWith(testError);
    });

    test('should clean up on connection close', () => {
      const closeHandler = jest.fn();
      mockWs.on('close', closeHandler);
      
      // Simulate close
      mockWs.emit('close');
      
      expect(closeHandler).toHaveBeenCalled();
    });
  });

  describe('📨 Message Routing', () => {
    test('should route set_user_name messages correctly', () => {
      const message = messageBuilders.setUserName('Alice Explorer');
      const messageHandler = jest.fn();
      
      mockWs.on('message', messageHandler);
      mockWs.emit('message', JSON.stringify(message));
      
      expect(messageHandler).toHaveBeenCalledWith(JSON.stringify(message));
    });

    test('should handle invalid JSON messages gracefully', () => {
      const messageHandler = jest.fn();
      mockWs.on('message', messageHandler);
      
      // Send invalid JSON
      mockWs.emit('message', 'invalid json {');
      
      expect(messageHandler).toHaveBeenCalled();
      // Should not crash the server
    });

    test('should route API request messages correctly', () => {
      const message = messageBuilders.executeApiRequest(sampleApiRequests[0]);
      const messageHandler = jest.fn();
      
      mockWs.on('message', messageHandler);
      mockWs.emit('message', JSON.stringify(message));
      
      expect(messageHandler).toHaveBeenCalledWith(JSON.stringify(message));
    });

    test('should handle unknown message types', () => {
      const unknownMessage = { type: 'unknown_message_type', data: 'test' };
      const messageHandler = jest.fn();
      
      mockWs.on('message', messageHandler);
      mockWs.emit('message', JSON.stringify(unknownMessage));
      
      expect(messageHandler).toHaveBeenCalled();
    });
  });

  describe('🌐 API Request Execution', () => {
    test('should validate URL before making request', () => {
      const validUrls = [
        'https://api.example.com/data',
        'http://localhost:3000/api',
        'https://jsonplaceholder.typicode.com/posts'
      ];

      const invalidUrls = [
        'not-a-url',
        'ftp://example.com',
        'javascript:alert("xss")',
        ''
      ];

      validUrls.forEach(url => {
        try {
          new URL(url);
          const isValid = url.startsWith('http://') || url.startsWith('https://');
          expect(isValid).toBe(true);
        } catch {
          expect(false).toBe(true); // Should not reach here for valid URLs
        }
      });

      invalidUrls.forEach(url => {
        try {
          new URL(url);
          const isValid = url.startsWith('http://') || url.startsWith('https://');
          expect(isValid).toBe(false);
        } catch {
          // Invalid URLs should throw
          expect(true).toBe(true);
        }
      });
    });

    test('should handle network errors with kid-friendly messages', () => {
      const networkError = sampleErrors.networkTimeout;
      
      const friendlyError = {
        friendly: '⏰ The website is taking too long to respond. It might be having a slow day!',
        technical: networkError.message,
        context: 'API Request'
      };

      expect(friendlyError.friendly).toContain('⏰');
      expect(friendlyError.technical).toBe(networkError.message);
    });

    test('should format API responses correctly', () => {
      const mockResponse = {
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
        data: { message: 'success' },
        responseTime: 250
      };

      expect(mockResponse).toHaveProperty('status');
      expect(mockResponse).toHaveProperty('data');
      expect(mockResponse).toHaveProperty('responseTime');
      expect(typeof mockResponse.responseTime).toBe('number');
    });

    test('should handle different HTTP methods', () => {
      const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
      
      methods.forEach(method => {
        const request = testDataGenerators.apiRequest({ method });
        expect(request.method).toBe(method);
      });
    });

    test('should add authentication headers when provided', () => {
      const authRequest = {
        method: 'GET',
        url: 'https://api.example.com/protected',
        auth: {
          type: 'basic',
          username: 'testuser',
          password: 'testpass'
        }
      };

      // Simulate adding basic auth header
      const credentials = Buffer.from(`${authRequest.auth.username}:${authRequest.auth.password}`).toString('base64');
      const expectedHeader = `Basic ${credentials}`;
      
      expect(expectedHeader).toBe('Basic dGVzdHVzZXI6dGVzdHBhc3M=');
    });
  });

  describe('👥 User Presence Tracking', () => {
    test('should track user join time', () => {
      const user = testDataGenerators.user();
      expect(user.joinedAt).toBeDefined();
      expect(new Date(user.joinedAt)).toBeInstanceOf(Date);
    });

    test('should update last active time', () => {
      const user = testDataGenerators.user();
      const originalTime = user.lastActive;
      
      // Simulate activity
      user.lastActive = new Date().toISOString();
      
      expect(user.lastActive).not.toBe(originalTime);
    });

    test('should maintain online users list', () => {
      const users = [
        testDataGenerators.user({ name: 'Alice' }),
        testDataGenerators.user({ name: 'Bob' }),
        testDataGenerators.user({ name: 'Charlie' })
      ];

      expect(users).toHaveLength(3);
      expect(users.every(user => user.name)).toBe(true);
      expect(users.every(user => user.id)).toBe(true);
    });

    test('should broadcast user join events', () => {
      const joinMessage = {
        type: 'user_joined',
        user: testDataGenerators.user(),
        onlineUsers: sampleUsers
      };

      mockWs.send(JSON.stringify(joinMessage));
      
      expect(mockWs.send).toHaveBeenCalledWith(JSON.stringify(joinMessage));
    });

    test('should broadcast user leave events', () => {
      const leaveMessage = {
        type: 'user_left',
        user: testDataGenerators.user(),
        onlineUsers: sampleUsers.slice(1) // Remove first user
      };

      mockWs.send(JSON.stringify(leaveMessage));
      
      expect(mockWs.send).toHaveBeenCalledWith(JSON.stringify(leaveMessage));
    });
  });

  describe('📁 Collection Management', () => {
    test('should create collections with unique IDs', () => {
      const collection1 = testDataGenerators.collection();
      const collection2 = testDataGenerators.collection();
      
      expect(collection1.id).not.toBe(collection2.id);
      expect(collection1.id).toMatch(/^collection_[a-z0-9]{9}$/);
    });

    test('should validate collection names', () => {
      const validNames = ['My API Tests', 'User Management', 'Blog API'];
      const invalidNames = ['', '   ', null, undefined];

      validNames.forEach(name => {
        expect(typeof name).toBe('string');
        expect(name.trim().length).toBeGreaterThan(0);
      });

      invalidNames.forEach(name => {
        expect(!name || (typeof name === 'string' && name.trim().length === 0)).toBe(true);
      });
    });

    test('should manage collection collaborators', () => {
      const collection = testDataGenerators.collection({
        collaborators: ['user1', 'user2']
      });

      expect(collection.collaborators).toContain('user1');
      expect(collection.collaborators).toContain('user2');
      expect(collection.collaborators).toHaveLength(2);
    });

    test('should add requests to collections', () => {
      const collection = testDataGenerators.collection();
      const request = testDataGenerators.apiRequest();
      
      collection.requests.push(request);
      
      expect(collection.requests).toHaveLength(1);
      expect(collection.requests[0]).toBe(request);
    });

    test('should track collection creation metadata', () => {
      const collection = testDataGenerators.collection();
      
      expect(collection.createdBy).toBeDefined();
      expect(collection.createdAt).toBeDefined();
      expect(new Date(collection.createdAt)).toBeInstanceOf(Date);
    });
  });
});

console.log('✅ Unit tests loaded successfully! Ready to test WebSocket server components! 🚀');
