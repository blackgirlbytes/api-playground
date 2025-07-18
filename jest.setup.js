// Jest setup file for kid-friendly testing environment
console.log('🧪 Setting up the testing playground for young developers!');

// Increase timeout for slower operations (kids need patience!)
jest.setTimeout(30000);

// Global test helpers
global.testHelpers = {
  delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  randomString: (length = 10) => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
};

// Mock WebSocket for testing
global.WebSocket = class MockWebSocket {
  constructor(url) {
    this.url = url;
    this.readyState = 1; // OPEN
    this.onopen = null;
    this.onmessage = null;
    this.onclose = null;
    this.onerror = null;
  }

  send(data) {
    // Mock send implementation
    console.log('📤 Mock WebSocket sent:', data);
  }

  close() {
    this.readyState = 3; // CLOSED
    if (this.onclose) this.onclose();
  }
};

// Add some encouraging console messages for test runs
const originalConsoleLog = console.log;
console.log = (...args) => {
  if (args[0] && typeof args[0] === 'string' && args[0].includes('PASS')) {
    originalConsoleLog('🎉', ...args);
  } else if (args[0] && typeof args[0] === 'string' && args[0].includes('FAIL')) {
    originalConsoleLog('😅', ...args, '- Don\'t worry, we\'ll fix this together!');
  } else {
    originalConsoleLog(...args);
  }
};
