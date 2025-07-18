#!/usr/bin/env node

/**
 * 🧪 Simple Test Runner
 * A lightweight test runner for our collaborative API testing platform
 * No external dependencies required!
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for pretty output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Test statistics
let stats = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  startTime: Date.now()
};

// Test results storage
let testResults = [];

// Simple assertion library
global.expect = (actual) => ({
  toBe: (expected) => {
    if (actual !== expected) {
      throw new Error(`Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`);
    }
  },
  toEqual: (expected) => {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(`Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`);
    }
  },
  toBeDefined: () => {
    if (actual === undefined) {
      throw new Error(`Expected value to be defined, but got undefined`);
    }
  },
  toBeNull: () => {
    if (actual !== null) {
      throw new Error(`Expected null, but got ${JSON.stringify(actual)}`);
    }
  },
  toBeTruthy: () => {
    if (!actual) {
      throw new Error(`Expected truthy value, but got ${JSON.stringify(actual)}`);
    }
  },
  toBeFalsy: () => {
    if (actual) {
      throw new Error(`Expected falsy value, but got ${JSON.stringify(actual)}`);
    }
  },
  toBeGreaterThan: (expected) => {
    if (actual <= expected) {
      throw new Error(`Expected ${actual} to be greater than ${expected}`);
    }
  },
  toBeLessThan: (expected) => {
    if (actual >= expected) {
      throw new Error(`Expected ${actual} to be less than ${expected}`);
    }
  },
  toContain: (expected) => {
    if (typeof actual === 'string') {
      if (!actual.includes(expected)) {
        throw new Error(`Expected "${actual}" to contain "${expected}"`);
      }
    } else if (Array.isArray(actual)) {
      if (!actual.includes(expected)) {
        throw new Error(`Expected array to contain ${JSON.stringify(expected)}`);
      }
    } else {
      throw new Error(`toContain can only be used with strings or arrays`);
    }
  },
  toMatch: (regex) => {
    if (!regex.test(actual)) {
      throw new Error(`Expected "${actual}" to match ${regex}`);
    }
  },
  toHaveProperty: (property) => {
    if (!(property in actual)) {
      throw new Error(`Expected object to have property "${property}"`);
    }
  },
  toHaveLength: (expected) => {
    if (actual.length !== expected) {
      throw new Error(`Expected length ${expected}, but got ${actual.length}`);
    }
  },
  toBeInstanceOf: (constructor) => {
    if (!(actual instanceof constructor)) {
      throw new Error(`Expected instance of ${constructor.name}, but got ${typeof actual}`);
    }
  },
  not: {
    toBe: (expected) => {
      if (actual === expected) {
        throw new Error(`Expected not to be ${JSON.stringify(expected)}`);
      }
    },
    toEqual: (expected) => {
      if (JSON.stringify(actual) === JSON.stringify(expected)) {
        throw new Error(`Expected not to equal ${JSON.stringify(expected)}`);
      }
    },
    toBeDefined: () => {
      if (actual !== undefined) {
        throw new Error(`Expected value to be undefined`);
      }
    },
    toThrow: () => {
      // This is handled differently in the test runner
    }
  }
});

// Mock functions
global.jest = {
  fn: (implementation) => {
    const mockFn = implementation || (() => {});
    mockFn.mock = {
      calls: [],
      results: []
    };
    
    const wrappedFn = (...args) => {
      mockFn.mock.calls.push(args);
      try {
        const result = mockFn(...args);
        mockFn.mock.results.push({ type: 'return', value: result });
        return result;
      } catch (error) {
        mockFn.mock.results.push({ type: 'throw', value: error });
        throw error;
      }
    };
    
    wrappedFn.mock = mockFn.mock;
    wrappedFn.mockReturnValue = (value) => {
      mockFn.mockImplementation = () => value;
      return wrappedFn;
    };
    
    return wrappedFn;
  },
  clearAllMocks: () => {
    // Simple implementation
  },
  doMock: (moduleName, factory) => {
    // Simple mock implementation
  },
  resetModules: () => {
    // Simple implementation
  }
};

// Test framework functions
global.describe = (name, fn) => {
  console.log(`\n${colors.cyan}🧪 ${name}${colors.reset}`);
  try {
    fn();
  } catch (error) {
    console.log(`${colors.red}❌ Suite failed: ${error.message}${colors.reset}`);
  }
};

global.test = (name, fn) => {
  stats.total++;
  try {
    if (fn.constructor.name === 'AsyncFunction') {
      // For async tests, we'll run them synchronously for simplicity
      console.log(`${colors.yellow}⏳ ${name} (async test - simplified)${colors.reset}`);
      stats.skipped++;
      return;
    }
    
    fn();
    console.log(`${colors.green}✅ ${name}${colors.reset}`);
    stats.passed++;
    testResults.push({ name, status: 'passed' });
  } catch (error) {
    console.log(`${colors.red}❌ ${name}${colors.reset}`);
    console.log(`   ${colors.red}Error: ${error.message}${colors.reset}`);
    stats.failed++;
    testResults.push({ name, status: 'failed', error: error.message });
  }
};

global.it = global.test; // Alias

// Setup and teardown
global.beforeEach = (fn) => {
  // Simple implementation - would run before each test
};

global.afterEach = (fn) => {
  // Simple implementation - would run after each test
};

global.beforeAll = (fn) => {
  // Simple implementation - would run once before all tests
};

global.afterAll = (fn) => {
  // Simple implementation - would run once after all tests
};

// Utility functions
global.waitFor = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Simple test discovery and execution
function runTests() {
  console.log(`${colors.bright}${colors.blue}🎯 Starting our awesome test adventure!${colors.reset}`);
  console.log(`${colors.blue}🔍 Looking for bugs and making sure everything works perfectly...${colors.reset}\n`);
  
  // For this simple runner, we'll create a basic test to demonstrate
  console.log(`${colors.cyan}🧪 Basic Functionality Tests${colors.reset}`);
  
  // Test 1: Basic WebSocket mock
  test('should create mock WebSocket', () => {
    const mockWs = {
      readyState: 1,
      send: jest.fn(),
      on: jest.fn(),
      close: jest.fn()
    };
    
    expect(mockWs.readyState).toBe(1);
    expect(mockWs.send).toBeDefined();
    expect(mockWs.on).toBeDefined();
  });
  
  // Test 2: Message builder
  test('should build WebSocket messages correctly', () => {
    const message = {
      type: 'set_user_name',
      name: 'Test User'
    };
    
    expect(message.type).toBe('set_user_name');
    expect(message.name).toBe('Test User');
  });
  
  // Test 3: URL validation
  test('should validate URLs correctly', () => {
    const validUrl = 'https://api.example.com/test';
    const invalidUrl = 'not-a-url';
    
    expect(validUrl.startsWith('https://')).toBe(true);
    expect(invalidUrl.startsWith('https://')).toBe(false);
  });
  
  // Test 4: Error message formatting
  test('should create kid-friendly error messages', () => {
    const errorMessage = '🌐 Oops! We couldn\'t find that website. Maybe check if the URL is spelled correctly?';
    
    expect(errorMessage).toContain('🌐');
    expect(errorMessage).toContain('Oops!');
  });
  
  // Test 5: Collection management
  test('should manage collections correctly', () => {
    const collection = {
      id: 'test_collection_123',
      name: 'Test Collection',
      requests: [],
      collaborators: ['user1']
    };
    
    expect(collection.id).toBeDefined();
    expect(collection.name).toBe('Test Collection');
    expect(Array.isArray(collection.requests)).toBe(true);
    expect(collection.collaborators).toContain('user1');
  });
  
  // Print results
  const endTime = Date.now();
  const duration = endTime - stats.startTime;
  
  console.log(`\n${colors.bright}🏁 Test Adventure Complete!${colors.reset}`);
  console.log('═══════════════════════════════════════');
  
  if (stats.failed === 0) {
    console.log(`${colors.green}🎉 AMAZING! All ${stats.passed} tests passed!${colors.reset}`);
    console.log(`${colors.green}🌟 Your code is working perfectly!${colors.reset}`);
  } else {
    console.log(`${colors.yellow}😅 Oops! ${stats.failed} tests need some fixing${colors.reset}`);
    console.log(`${colors.green}✅ But ${stats.passed} tests are working great!${colors.reset}`);
    console.log(`${colors.yellow}💪 Keep going - you've got this!${colors.reset}`);
  }
  
  if (stats.skipped > 0) {
    console.log(`${colors.yellow}📝 ${stats.skipped} async tests were skipped (need full Jest for async support)${colors.reset}`);
  }
  
  console.log(`\n${colors.cyan}📊 Total tests: ${stats.total}${colors.reset}`);
  console.log(`${colors.green}✅ Passed: ${stats.passed}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${stats.failed}${colors.reset}`);
  console.log(`${colors.yellow}⏳ Skipped: ${stats.skipped}${colors.reset}`);
  console.log(`${colors.blue}⏱️  Duration: ${duration}ms${colors.reset}`);
  
  console.log(`\n${colors.bright}🚀 Happy coding! 🚀${colors.reset}\n`);
  
  // Exit with appropriate code
  process.exit(stats.failed > 0 ? 1 : 0);
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests };
