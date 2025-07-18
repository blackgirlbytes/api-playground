const WebSocket = require('ws');

/**
 * 🛠️ Test Utilities - Your Testing Toolkit!
 * These helpers make testing easier and more fun!
 */

/**
 * 🎭 Create a mock WebSocket server for testing
 */
function createMockWebSocketServer(port = 0) {
  const server = require('http').createServer();
  const wss = new WebSocket.Server({ server });
  const connections = [];
  const messages = [];

  wss.on('connection', (ws) => {
    connections.push(ws);
    
    ws.on('message', (data) => {
      messages.push({
        timestamp: Date.now(),
        data: data.toString(),
        parsed: (() => {
          try {
            return JSON.parse(data.toString());
          } catch {
            return null;
          }
        })()
      });
    });
  });

  return new Promise((resolve) => {
    server.listen(port, () => {
      const actualPort = server.address().port;
      resolve({
        server,
        wss,
        port: actualPort,
        url: `ws://localhost:${actualPort}`,
        connections,
        messages,
        close: () => {
          return new Promise((resolveClose) => {
            server.close(resolveClose);
          });
        }
      });
    });
  });
}

/**
 * 🔌 Create a WebSocket client for testing
 */
function createTestWebSocketClient(url) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    const receivedMessages = [];

    ws.on('open', () => {
      resolve({
        ws,
        messages: receivedMessages,
        send: (data) => {
          const message = typeof data === 'string' ? data : JSON.stringify(data);
          ws.send(message);
        },
        close: () => {
          return new Promise((resolveClose) => {
            ws.on('close', resolveClose);
            ws.close();
          });
        }
      });
    });

    ws.on('message', (data) => {
      receivedMessages.push({
        timestamp: Date.now(),
        raw: data.toString(),
        parsed: (() => {
          try {
            return JSON.parse(data.toString());
          } catch {
            return null;
          }
        })()
      });
    });

    ws.on('error', reject);
  });
}

/**
 * ⏰ Wait for a condition to be true
 */
async function waitForCondition(condition, timeout = 5000, interval = 100) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  throw new Error(`Condition not met within ${timeout}ms`);
}

/**
 * 📨 Wait for a specific message type
 */
async function waitForMessage(client, messageType, timeout = 5000) {
  return waitForCondition(() => {
    return client.messages.some(msg => 
      msg.parsed && msg.parsed.type === messageType
    );
  }, timeout);
}

/**
 * 🎯 Find a message by type
 */
function findMessage(messages, type) {
  return messages.find(msg => msg.parsed && msg.parsed.type === type);
}

/**
 * 🧪 Create test data generators
 */
const testDataGenerators = {
  /**
   * 👤 Generate a random user
   */
  user: (overrides = {}) => ({
    id: `user_${Math.random().toString(36).substr(2, 9)}`,
    name: `TestUser${Math.floor(Math.random() * 1000)}`,
    joinedAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    ...overrides
  }),

  /**
   * 🌐 Generate an API request
   */
  apiRequest: (overrides = {}) => ({
    method: 'GET',
    url: 'https://jsonplaceholder.typicode.com/posts/1',
    headers: { 'Content-Type': 'application/json' },
    ...overrides
  }),

  /**
   * 📁 Generate a collection
   */
  collection: (overrides = {}) => ({
    id: `collection_${Math.random().toString(36).substr(2, 9)}`,
    name: `Test Collection ${Math.floor(Math.random() * 1000)}`,
    description: 'A test collection for API requests',
    requests: [],
    createdBy: 'test_user',
    createdAt: new Date().toISOString(),
    collaborators: ['test_user'],
    ...overrides
  }),

  /**
   * 📊 Generate an API response
   */
  apiResponse: (overrides = {}) => ({
    status: 200,
    statusText: 'OK',
    headers: { 'content-type': 'application/json' },
    data: { message: 'Test response' },
    responseTime: Math.floor(Math.random() * 1000) + 100,
    ...overrides
  })
};

/**
 * 🎨 Message builders for common test scenarios
 */
const messageBuilders = {
  setUserName: (name) => ({
    type: 'set_user_name',
    name
  }),

  executeApiRequest: (request) => ({
    type: 'execute_api_request',
    request
  }),

  createCollection: (name, description = '') => ({
    type: 'create_collection',
    name,
    description
  }),

  joinCollection: (collectionId) => ({
    type: 'join_collection',
    collectionId
  }),

  addRequestToCollection: (collectionId, request) => ({
    type: 'add_request_to_collection',
    collectionId,
    request
  })
};

/**
 * 🔍 Assertion helpers
 */
const assertions = {
  /**
   * Check if a message has the expected structure
   */
  messageHasStructure: (message, expectedStructure) => {
    const checkStructure = (obj, structure) => {
      for (const key in structure) {
        if (!(key in obj)) {
          return false;
        }
        if (typeof structure[key] === 'object' && structure[key] !== null) {
          if (!checkStructure(obj[key], structure[key])) {
            return false;
          }
        }
      }
      return true;
    };
    
    return checkStructure(message, expectedStructure);
  },

  /**
   * Check if an array contains a message with specific properties
   */
  messagesContain: (messages, properties) => {
    return messages.some(msg => {
      if (!msg.parsed) return false;
      
      for (const key in properties) {
        if (msg.parsed[key] !== properties[key]) {
          return false;
        }
      }
      return true;
    });
  }
};

module.exports = {
  createMockWebSocketServer,
  createTestWebSocketClient,
  waitForCondition,
  waitForMessage,
  findMessage,
  testDataGenerators,
  messageBuilders,
  assertions
};
