// Global test setup
console.log('🚀 Setting up tests with kid-friendly magic!');

// Increase timeout for integration tests
jest.setTimeout(30000);

// Mock console methods to capture output
global.mockConsole = () => {
  const originalConsole = { ...console };
  const logs = [];
  
  console.log = (...args) => {
    logs.push({ type: 'log', args });
    originalConsole.log(...args);
  };
  
  console.error = (...args) => {
    logs.push({ type: 'error', args });
    originalConsole.error(...args);
  };
  
  return {
    logs,
    restore: () => {
      Object.assign(console, originalConsole);
    }
  };
};

// Helper to wait for async operations
global.waitFor = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to create mock WebSocket
global.createMockWebSocket = () => {
  const events = {};
  const sentMessages = [];
  
  return {
    readyState: 1, // OPEN
    send: jest.fn((message) => {
      sentMessages.push(message);
    }),
    on: jest.fn((event, handler) => {
      events[event] = handler;
    }),
    emit: (event, ...args) => {
      if (events[event]) {
        events[event](...args);
      }
    },
    close: jest.fn(),
    sentMessages,
    events
  };
};

console.log('✨ Test setup complete! Ready to test some awesome code!');
