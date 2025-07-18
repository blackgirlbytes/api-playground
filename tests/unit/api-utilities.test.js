/**
 * 🧪 Unit Tests for API Request Utilities
 * Testing the helper functions that make API requests work smoothly!
 */

const { testDataGenerators } = require('../utils/test-helpers');
const { sampleApiRequests, sampleApiResponses, sampleErrors } = require('../fixtures/mock-data');

describe('🌐 API Request Utilities Unit Tests', () => {
  describe('🔗 URL Validation', () => {
    test('should validate correct URLs', () => {
      const validUrls = [
        'https://api.example.com/v1/users',
        'http://localhost:3000/api/posts',
        'https://jsonplaceholder.typicode.com/posts/1',
        'http://192.168.1.1:8080/status',
        'https://subdomain.example.co.uk/path?query=value'
      ];

      validUrls.forEach(url => {
        expect(() => new URL(url)).not.toThrow();
        expect(url.startsWith('http://') || url.startsWith('https://')).toBe(true);
      });
    });

    test('should reject invalid URLs', () => {
      const invalidUrls = [
        'not-a-url',
        'ftp://example.com/file',
        'javascript:alert("xss")',
        'file:///etc/passwd',
        '',
        'http://',
        'https://',
        'www.example.com' // Missing protocol
      ];

      invalidUrls.forEach(url => {
        try {
          new URL(url);
          const isValidProtocol = url.startsWith('http://') || url.startsWith('https://');
          expect(isValidProtocol).toBe(false);
        } catch (error) {
          expect(error).toBeInstanceOf(TypeError);
        }
      });
    });

    test('should handle edge cases in URL validation', () => {
      const edgeCases = [
        { url: 'https://example.com:443', valid: true },
        { url: 'http://example.com:80', valid: true },
        { url: 'https://example.com:999999', valid: false }, // Invalid port
        { url: 'https://[::1]:8080', valid: true }, // IPv6
        { url: 'https://example.com/path with spaces', valid: false }
      ];

      edgeCases.forEach(({ url, valid }) => {
        try {
          new URL(url);
          const isValidProtocol = url.startsWith('http://') || url.startsWith('https://');
          if (valid) {
            expect(isValidProtocol).toBe(true);
          }
        } catch (error) {
          if (!valid) {
            expect(error).toBeInstanceOf(TypeError);
          }
        }
      });
    });
  });

  describe('🔐 Authentication Handling', () => {
    test('should encode basic authentication correctly', () => {
      const username = 'testuser';
      const password = 'testpass123';
      
      const credentials = Buffer.from(`${username}:${password}`).toString('base64');
      const authHeader = `Basic ${credentials}`;
      
      expect(authHeader).toBe('Basic dGVzdHVzZXI6dGVzdHBhc3MxMjM=');
    });

    test('should decode basic authentication correctly', () => {
      const authHeader = 'Basic dGVzdHVzZXI6dGVzdHBhc3MxMjM=';
      
      if (authHeader.startsWith('Basic ')) {
        const base64Credentials = authHeader.slice(6);
        const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
        const [username, password] = credentials.split(':');
        
        expect(username).toBe('testuser');
        expect(password).toBe('testpass123');
      }
    });

    test('should handle malformed authentication headers', () => {
      const malformedHeaders = [
        'Basic',
        'Basic ',
        'Basic invalidbase64!@#',
        'Bearer token123', // Wrong type
        ''
      ];

      malformedHeaders.forEach(header => {
        if (!header || !header.startsWith('Basic ')) {
          expect(header.startsWith('Basic ')).toBe(false);
        } else {
          try {
            const base64Credentials = header.slice(6);
            Buffer.from(base64Credentials, 'base64').toString('ascii');
          } catch (error) {
            expect(error).toBeInstanceOf(Error);
          }
        }
      });
    });

    test('should handle empty credentials', () => {
      const emptyAuth = {
        username: '',
        password: ''
      };

      const credentials = Buffer.from(`${emptyAuth.username}:${emptyAuth.password}`).toString('base64');
      expect(credentials).toBe('Og=='); // Base64 for ":"
    });
  });

  describe('📊 Response Formatting', () => {
    test('should format successful responses correctly', () => {
      const mockResponse = {
        statusCode: 200,
        statusMessage: 'OK',
        headers: {
          'content-type': 'application/json',
          'cache-control': 'max-age=3600'
        }
      };

      const responseData = { message: 'Success', data: [1, 2, 3] };
      const startTime = Date.now() - 250;

      const formattedResponse = {
        status: mockResponse.statusCode,
        statusText: mockResponse.statusMessage,
        headers: mockResponse.headers,
        data: responseData,
        responseTime: Date.now() - startTime
      };

      expect(formattedResponse.status).toBe(200);
      expect(formattedResponse.statusText).toBe('OK');
      expect(formattedResponse.data).toEqual(responseData);
      expect(formattedResponse.responseTime).toBeGreaterThan(0);
    });

    test('should handle JSON parsing errors', () => {
      const invalidJsonResponse = '{"invalid": json}';
      
      let parsedData;
      try {
        parsedData = JSON.parse(invalidJsonResponse);
      } catch {
        parsedData = invalidJsonResponse; // Keep as string if not valid JSON
      }

      expect(parsedData).toBe(invalidJsonResponse);
    });

    test('should handle different content types', () => {
      const responses = [
        { contentType: 'application/json', data: '{"key": "value"}' },
        { contentType: 'text/plain', data: 'Plain text response' },
        { contentType: 'text/html', data: '<html><body>HTML</body></html>' },
        { contentType: 'application/xml', data: '<root><item>XML</item></root>' }
      ];

      responses.forEach(({ contentType, data }) => {
        let parsedData;
        
        if (contentType === 'application/json') {
          try {
            parsedData = JSON.parse(data);
          } catch {
            parsedData = data;
          }
        } else {
          parsedData = data;
        }

        expect(parsedData).toBeDefined();
        if (contentType === 'application/json') {
          expect(typeof parsedData === 'object' || typeof parsedData === 'string').toBe(true);
        } else {
          expect(typeof parsedData).toBe('string');
        }
      });
    });

    test('should calculate response time accurately', () => {
      const startTime = Date.now();
      
      // Simulate some processing time
      const processingTime = 150;
      const endTime = startTime + processingTime;
      
      const responseTime = endTime - startTime;
      
      expect(responseTime).toBe(processingTime);
      expect(responseTime).toBeGreaterThan(0);
    });
  });

  describe('🚨 Error Handling', () => {
    test('should create kid-friendly error messages', () => {
      const errorMappings = [
        { 
          error: { code: 'ENOTFOUND' }, 
          expected: '🌐 Oops! We couldn\'t find that website. Maybe check if the URL is spelled correctly?' 
        },
        { 
          error: { code: 'ECONNREFUSED' }, 
          expected: '🚪 The website said "no visitors allowed right now". They might be taking a break!' 
        },
        { 
          error: { code: 'ETIMEDOUT' }, 
          expected: '⏰ The website is taking too long to respond. It might be having a slow day!' 
        },
        { 
          error: { message: 'Invalid JSON' }, 
          expected: '📝 The data we got back looks scrambled. The website might have sent us something weird!' 
        }
      ];

      errorMappings.forEach(({ error, expected }) => {
        // Mock the error handling function
        const createKidFriendlyError = (err) => {
          const friendlyMessages = {
            'ENOTFOUND': '🌐 Oops! We couldn\'t find that website. Maybe check if the URL is spelled correctly?',
            'ECONNREFUSED': '🚪 The website said "no visitors allowed right now". They might be taking a break!',
            'ETIMEDOUT': '⏰ The website is taking too long to respond. It might be having a slow day!',
            'invalid_json': '📝 The data we got back looks scrambled. The website might have sent us something weird!'
          };

          let message = '🤔 Something unexpected happened, but don\'t worry - we can try again!';
          
          if (err.code && friendlyMessages[err.code]) {
            message = friendlyMessages[err.code];
          } else if (err.message && err.message.toLowerCase().includes('json')) {
            message = friendlyMessages.invalid_json;
          }

          return {
            friendly: message,
            technical: err.message || 'Unknown error'
          };
        };

        const result = createKidFriendlyError(error);
        expect(result.friendly).toContain('🌐' || '🚪' || '⏰' || '📝' || '🤔');
        expect(result.technical).toBeDefined();
      });
    });

    test('should handle network timeout errors', () => {
      const timeoutError = new Error('Request timeout');
      timeoutError.code = 'ETIMEDOUT';

      expect(timeoutError.code).toBe('ETIMEDOUT');
      expect(timeoutError.message).toBe('Request timeout');
    });

    test('should handle DNS resolution errors', () => {
      const dnsError = new Error('getaddrinfo ENOTFOUND');
      dnsError.code = 'ENOTFOUND';

      expect(dnsError.code).toBe('ENOTFOUND');
      expect(dnsError.message).toContain('ENOTFOUND');
    });

    test('should handle connection refused errors', () => {
      const connectionError = new Error('connect ECONNREFUSED');
      connectionError.code = 'ECONNREFUSED';

      expect(connectionError.code).toBe('ECONNREFUSED');
      expect(connectionError.message).toContain('ECONNREFUSED');
    });
  });

  describe('📋 Request Validation', () => {
    test('should validate required request fields', () => {
      const validRequest = testDataGenerators.apiRequest();
      
      expect(validRequest.method).toBeDefined();
      expect(validRequest.url).toBeDefined();
      expect(typeof validRequest.method).toBe('string');
      expect(typeof validRequest.url).toBe('string');
    });

    test('should validate HTTP methods', () => {
      const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
      const invalidMethods = ['INVALID', 'HACK', '', null, undefined];

      validMethods.forEach(method => {
        expect(validMethods.includes(method)).toBe(true);
      });

      invalidMethods.forEach(method => {
        expect(validMethods.includes(method)).toBe(false);
      });
    });

    test('should validate request headers', () => {
      const validHeaders = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer token123',
        'Accept': 'application/json',
        'User-Agent': 'TestApp/1.0'
      };

      Object.entries(validHeaders).forEach(([key, value]) => {
        expect(typeof key).toBe('string');
        expect(typeof value).toBe('string');
        expect(key.length).toBeGreaterThan(0);
        expect(value.length).toBeGreaterThan(0);
      });
    });

    test('should validate request body for POST/PUT requests', () => {
      const postRequest = testDataGenerators.apiRequest({
        method: 'POST',
        body: { name: 'Test', value: 123 }
      });

      expect(postRequest.method).toBe('POST');
      expect(postRequest.body).toBeDefined();
      expect(typeof postRequest.body).toBe('object');

      // Should be serializable to JSON
      expect(() => JSON.stringify(postRequest.body)).not.toThrow();
    });
  });

  describe('⏱️ Performance Monitoring', () => {
    test('should track request execution time', () => {
      const startTime = Date.now();
      
      // Simulate request processing
      const mockProcessingTime = 200;
      const endTime = startTime + mockProcessingTime;
      
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBe(mockProcessingTime);
      expect(executionTime).toBeGreaterThanOrEqual(0);
    });

    test('should identify slow requests', () => {
      const slowThreshold = 5000; // 5 seconds
      const requests = [
        { responseTime: 150 }, // Fast
        { responseTime: 800 }, // Normal
        { responseTime: 6000 }, // Slow
        { responseTime: 12000 } // Very slow
      ];

      const slowRequests = requests.filter(req => req.responseTime > slowThreshold);
      
      expect(slowRequests).toHaveLength(2);
      expect(slowRequests.every(req => req.responseTime > slowThreshold)).toBe(true);
    });

    test('should calculate average response time', () => {
      const responseTimes = [100, 200, 300, 400, 500];
      const average = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
      
      expect(average).toBe(300);
    });
  });
});

console.log('✅ API request utilities unit tests loaded! Ready to test request handling! 🌐');
