const { describe, it, expect, beforeEach, afterEach } = require('@jest/globals');
const WebSocket = require('ws');
const { ConflictResolver, ResponseFormatter, HistoryManager } = require('./conflict-resolution');

// 🧪 Test Suite for Kid-Friendly API Testing Platform
// Making sure everything works perfectly for our young developers! 

describe('🚀 API Adventure Playground Test Suite', () => {
    let server;
    let testPort = 3002;

    beforeEach(() => {
        // Set up test environment like preparing a science experiment! 🔬
        console.log('🧪 Setting up test environment...');
    });

    afterEach(() => {
        // Clean up after tests like tidying up after playtime! 🧹
        if (server) {
            server.close();
        }
    });

    describe('🤝 Conflict Resolution System', () => {
        let conflictResolver;

        beforeEach(() => {
            conflictResolver = new ConflictResolver();
        });

        it('🎯 should handle simple operations without conflicts', () => {
            const operation = {
                type: 'edit',
                field: 'url',
                position: 0,
                text: 'https://api.example.com',
                userId: 'TestKid1'
            };

            const result = conflictResolver.applyOperation(operation, 'TestKid1');
            
            expect(result).toBeDefined();
            expect(result.type).toBe('edit');
            expect(conflictResolver.operations).toHaveLength(1);
            
            console.log('✅ Simple operations work like magic! 🎉');
        });

        it('🤝 should resolve conflicts between two users', () => {
            const op1 = {
                type: 'edit',
                field: 'url',
                position: 10,
                text: 'test',
                userId: 'Kid1'
            };

            const op2 = {
                type: 'edit',
                field: 'url',
                position: 12,
                text: 'data',
                userId: 'Kid2'
            };

            conflictResolver.pendingOperations = [op2];
            const result = conflictResolver.applyOperation(op1, 'Kid1');

            expect(result.resolvedConflict).toBeTruthy();
            console.log('🤝 Conflict resolution works like kids sharing toys! 🎈');
        });

        it('🔒 should handle resource locking like taking turns', () => {
            const lock1 = conflictResolver.acquireLock('request1', 'Kid1');
            expect(lock1.success).toBe(true);
            
            const lock2 = conflictResolver.acquireLock('request1', 'Kid2');
            expect(lock2.success).toBe(false);
            expect(lock2.message).toContain('waiting for your turn');
            
            console.log('🔒 Resource locking works like a polite queue! 🚶‍♀️🚶‍♂️');
        });

        it('🔓 should release locks properly', () => {
            conflictResolver.acquireLock('request1', 'Kid1');
            const released = conflictResolver.releaseLock('request1', 'Kid1');
            
            expect(released).toBe(true);
            expect(conflictResolver.locks.has('request1')).toBe(false);
            
            console.log('🔓 Lock release works like returning borrowed toys! 🎁');
        });

        it('📚 should maintain operation history', () => {
            const operations = [
                { type: 'edit', userId: 'Kid1' },
                { type: 'test', userId: 'Kid2' },
                { type: 'save', userId: 'Kid1' }
            ];

            operations.forEach(op => {
                conflictResolver.applyOperation(op, op.userId);
            });

            const history = conflictResolver.getHistory();
            expect(history).toHaveLength(3);
            expect(history[0].friendlyDescription).toContain('did something cool');
            
            console.log('📚 History tracking works like a diary of adventures! 📖');
        });
    });

    describe('🎨 Response Formatter', () => {
        let formatter;

        beforeEach(() => {
            formatter = new ResponseFormatter();
        });

        it('🎉 should format successful responses with kid-friendly messages', () => {
            const response = {
                status: 200,
                data: { message: 'Hello World!' },
                headers: { 'content-type': 'application/json' }
            };

            const formatted = formatter.formatResponse(response, 150);
            
            expect(formatted.success).toBe(true);
            expect(formatted.status.emoji).toBe('🎉');
            expect(formatted.status.message).toContain('magic spell');
            expect(formatted.timing.emoji).toBe('🏃');
            
            console.log('🎉 Success responses are as exciting as finding treasure! 💎');
        });

        it('😅 should format error responses with encouraging messages', () => {
            const response = {
                status: 404,
                data: { error: 'Not found' },
                headers: {}
            };

            const formatted = formatter.formatResponse(response, 200);
            
            expect(formatted.success).toBe(false);
            expect(formatted.status.emoji).toBe('🔍');
            expect(formatted.status.message).toContain('toy box');
            
            console.log('😅 Error messages are helpful like a friendly teacher! 👩‍🏫');
        });

        it('⚡ should categorize response timing correctly', () => {
            const fastResponse = { status: 200, data: {}, headers: {} };
            const slowResponse = { status: 200, data: {}, headers: {} };

            const fast = formatter.formatResponse(fastResponse, 50);
            const slow = formatter.formatResponse(slowResponse, 1500);

            expect(fast.timing.emoji).toBe('⚡');
            expect(fast.timing.description).toContain('blinking');
            
            expect(slow.timing.emoji).toBe('🐌');
            expect(slow.timing.description).toContain('cookies');
            
            console.log('⚡ Timing categories work like a stopwatch for kids! ⏱️');
        });

        it('📏 should format response sizes understandably', () => {
            const smallData = 'Hi!';
            const bigData = 'x'.repeat(2000);

            const small = formatter.formatSize(smallData.length);
            const big = formatter.formatSize(bigData.length);

            expect(small.emoji).toBe('📄');
            expect(small.description).toContain('note');
            
            expect(big.emoji).toBe('📋');
            expect(big.description).toContain('essay');
            
            console.log('📏 Size formatting is as clear as measuring with rulers! 📐');
        });

        it('🔍 should find interesting parts in responses', () => {
            const textWithNumbers = 'I have 5 cats and 3 dogs!';
            const highlights = formatter.findInterestingParts(textWithNumbers);
            
            expect(highlights).toHaveLength(1);
            expect(highlights[0].type).toBe('numbers');
            expect(highlights[0].emoji).toBe('🔢');
            
            console.log('🔍 Finding interesting parts works like a treasure hunt! 🗺️');
        });
    });

    describe('📚 History Manager', () => {
        let historyManager;

        beforeEach(() => {
            historyManager = new HistoryManager();
        });

        it('💾 should save requests to history', () => {
            const request = {
                method: 'GET',
                url: 'https://api.example.com/test',
                headers: {},
                body: null
            };

            const response = {
                status: 200,
                data: { result: 'success' },
                headers: {},
                timing: 100
            };

            const saved = historyManager.saveRequest(request, response, 'TestKid');
            
            expect(saved.id).toBeDefined();
            expect(saved.userId).toBe('TestKid');
            expect(saved.metadata.friendlyName).toContain('GET request');
            expect(historyManager.history).toHaveLength(1);
            
            console.log('💾 Saving requests works like keeping a scrapbook! 📔');
        });

        it('🔍 should retrieve user history correctly', () => {
            // Add some test requests
            const requests = [
                { method: 'GET', url: 'https://api1.com', headers: {}, body: null },
                { method: 'POST', url: 'https://api2.com', headers: {}, body: '{}' }
            ];

            const response = { status: 200, data: {}, headers: {}, timing: 100 };

            requests.forEach((req, i) => {
                historyManager.saveRequest(req, response, `Kid${i + 1}`);
            });

            const kid1History = historyManager.getUserHistory('Kid1');
            const kid2History = historyManager.getUserHistory('Kid2');

            expect(kid1History).toHaveLength(1);
            expect(kid2History).toHaveLength(1);
            expect(kid1History[0].request.method).toBe('GET');
            expect(kid2History[0].request.method).toBe('POST');
            
            console.log('🔍 User history retrieval works like finding your own drawings! 🎨');
        });

        it('🔄 should replay requests successfully', () => {
            const request = {
                method: 'GET',
                url: 'https://api.example.com',
                headers: { 'Content-Type': 'application/json' },
                body: null
            };

            const response = { status: 200, data: {}, headers: {}, timing: 100 };
            const saved = historyManager.saveRequest(request, response, 'TestKid');

            const replayed = historyManager.replayRequest(saved.id, 'TestKid');
            
            expect(replayed.success).toBe(true);
            expect(replayed.request.method).toBe('GET');
            expect(replayed.request.url).toBe('https://api.example.com');
            expect(replayed.message).toContain('favorite movie');
            
            console.log('🔄 Request replay works like rewatching favorite cartoons! 📺');
        });

        it('📦 should create collections from history', () => {
            // Add some requests to history
            const requests = [
                { method: 'GET', url: 'https://dog.ceo/api/breeds/image/random', headers: {}, body: null },
                { method: 'GET', url: 'https://official-joke-api.appspot.com/random_joke', headers: {}, body: null }
            ];

            const response = { status: 200, data: {}, headers: {}, timing: 100 };
            const historyIds = [];

            requests.forEach(req => {
                const saved = historyManager.saveRequest(req, response, 'TestKid');
                historyIds.push(saved.id);
            });

            const collection = historyManager.createCollection(
                'Fun APIs',
                historyIds,
                'TestKid',
                'A collection of fun APIs for kids'
            );

            expect(collection.success).toBe(true);
            expect(collection.collection.name).toBe('Fun APIs');
            expect(collection.collection.requests).toHaveLength(2);
            expect(collection.message).toContain('playlist');
            
            console.log('📦 Collection creation works like making a playlist! 🎵');
        });

        it('📤 should export collections properly', () => {
            // Create a test collection first
            const request = { method: 'GET', url: 'https://api.test.com', headers: {}, body: null };
            const response = { status: 200, data: {}, headers: {}, timing: 100 };
            const saved = historyManager.saveRequest(request, response, 'TestKid');

            const collection = historyManager.createCollection('Test Collection', [saved.id], 'TestKid');
            const exported = historyManager.exportCollection(collection.collection.id);

            expect(exported.success).toBe(true);
            expect(exported.data.name).toBe('Test Collection');
            expect(exported.filename).toContain('Test_Collection');
            expect(exported.data.kidFriendlyNote).toContain('Kid-Friendly');
            
            console.log('📤 Collection export works like sharing recipes! 🍪');
        });

        it('📥 should import collections successfully', () => {
            const collectionData = {
                id: 'test123',
                name: 'Imported Collection',
                description: 'Test import',
                requests: [
                    {
                        name: 'Test Request',
                        request: { method: 'GET', url: 'https://test.com' },
                        tags: ['test']
                    }
                ],
                collaborators: ['OriginalKid']
            };

            const imported = historyManager.importCollection(collectionData, 'ImportingKid');

            expect(imported.success).toBe(true);
            expect(imported.collection.name).toBe('Imported Collection');
            expect(imported.collection.collaborators).toContain('ImportingKid');
            expect(imported.collection.importedBy).toBe('ImportingKid');
            
            console.log('📥 Collection import works like receiving a gift box! 🎁');
        });

        it('🏷️ should generate appropriate tags', () => {
            const request = { method: 'POST', url: 'https://api.example.com/users' };
            const response = { 
                status: 201, 
                headers: { 'content-type': 'application/json' }
            };

            const tags = historyManager.generateTags(request, response);

            expect(tags).toContain('post');
            expect(tags).toContain('success');
            expect(tags).toContain('json');
            expect(tags).toContain('users');
            
            console.log('🏷️ Tag generation works like organizing toys by type! 🧸');
        });

        it('🧹 should clean up old history', () => {
            // Add some old entries (simulate by manipulating timestamp)
            const oldRequest = { method: 'GET', url: 'https://old.api.com', headers: {}, body: null };
            const response = { status: 200, data: {}, headers: {}, timing: 100 };
            
            const saved = historyManager.saveRequest(oldRequest, response, 'TestKid');
            
            // Make it old (31 days ago)
            const oldTimestamp = Date.now() - (31 * 24 * 60 * 60 * 1000);
            historyManager.history[0].timestamp = oldTimestamp;

            const initialLength = historyManager.history.length;
            historyManager.cleanup();
            
            expect(historyManager.history.length).toBeLessThan(initialLength);
            
            console.log('🧹 History cleanup works like organizing your room! 🏠');
        });
    });

    describe('🌐 Integration Tests', () => {
        it('🤝 should handle complete collaboration workflow', async () => {
            const conflictResolver = new ConflictResolver();
            const historyManager = new HistoryManager();
            const formatter = new ResponseFormatter();

            // Simulate two users working together
            const user1Operation = {
                type: 'edit',
                field: 'url',
                position: 0,
                text: 'https://api.example.com',
                userId: 'Kid1'
            };

            const user2Operation = {
                type: 'edit',
                field: 'headers',
                position: 0,
                text: 'Content-Type: application/json',
                userId: 'Kid2'
            };

            // Apply operations
            const result1 = conflictResolver.applyOperation(user1Operation, 'Kid1');
            const result2 = conflictResolver.applyOperation(user2Operation, 'Kid2');

            expect(result1).toBeDefined();
            expect(result2).toBeDefined();
            expect(conflictResolver.operations).toHaveLength(2);

            // Simulate API response
            const mockResponse = {
                status: 200,
                data: { message: 'Success!' },
                headers: { 'content-type': 'application/json' }
            };

            const formattedResponse = formatter.formatResponse(mockResponse, 123);
            expect(formattedResponse.success).toBe(true);

            // Save to history
            const mockRequest = {
                method: 'GET',
                url: 'https://api.example.com',
                headers: {},
                body: null
            };

            const historyEntry = historyManager.saveRequest(mockRequest, mockResponse, 'Kid1');
            expect(historyEntry.id).toBeDefined();

            console.log('🤝 Complete collaboration workflow works like a team project! 👥');
        });

        it('🚀 should handle error scenarios gracefully', () => {
            const formatter = new ResponseFormatter();
            const historyManager = new HistoryManager();

            // Test error response formatting
            const errorResponse = {
                status: 500,
                data: { error: 'Internal server error' },
                headers: {}
            };

            const formatted = formatter.formatResponse(errorResponse, 5000);
            expect(formatted.success).toBe(false);
            expect(formatted.status.message).toContain('hiccup');

            // Test invalid history replay
            const replay = historyManager.replayRequest('nonexistent', 'TestKid');
            expect(replay.success).toBe(false);
            expect(replay.message).toContain('lost');

            console.log('🚀 Error handling works like having a safety net! 🛡️');
        });
    });

    describe('🎯 Performance Tests', () => {
        it('⚡ should handle multiple operations efficiently', () => {
            const conflictResolver = new ConflictResolver();
            const startTime = Date.now();

            // Apply 100 operations
            for (let i = 0; i < 100; i++) {
                const operation = {
                    type: 'edit',
                    field: 'test',
                    position: i,
                    text: `test${i}`,
                    userId: `Kid${i % 5}`
                };
                conflictResolver.applyOperation(operation, operation.userId);
            }

            const endTime = Date.now();
            const duration = endTime - startTime;

            expect(conflictResolver.operations).toHaveLength(100);
            expect(duration).toBeLessThan(1000); // Should complete in under 1 second

            console.log(`⚡ Processed 100 operations in ${duration}ms - faster than counting to 100! 🔢`);
        });

        it('📚 should handle large history efficiently', () => {
            const historyManager = new HistoryManager();
            const startTime = Date.now();

            // Add 500 history entries
            for (let i = 0; i < 500; i++) {
                const request = {
                    method: 'GET',
                    url: `https://api${i}.example.com`,
                    headers: {},
                    body: null
                };
                const response = { status: 200, data: {}, headers: {}, timing: 100 };
                historyManager.saveRequest(request, response, `Kid${i % 10}`);
            }

            const endTime = Date.now();
            const duration = endTime - startTime;

            expect(historyManager.history).toHaveLength(500);
            expect(duration).toBeLessThan(2000); // Should complete in under 2 seconds

            console.log(`📚 Saved 500 history entries in ${duration}ms - like filling a huge scrapbook! 📖`);
        });
    });
});

// 🎉 Test utilities and helpers
class TestHelpers {
    static createMockWebSocket() {
        return {
            send: jest.fn(),
            close: jest.fn(),
            readyState: 1, // OPEN
            addEventListener: jest.fn(),
            removeEventListener: jest.fn()
        };
    }

    static createMockRequest(overrides = {}) {
        return {
            method: 'GET',
            url: 'https://api.example.com/test',
            headers: { 'Content-Type': 'application/json' },
            body: null,
            ...overrides
        };
    }

    static createMockResponse(overrides = {}) {
        return {
            status: 200,
            data: { message: 'Test response' },
            headers: { 'content-type': 'application/json' },
            timing: 150,
            ...overrides
        };
    }

    static async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static generateRandomString(length = 10) {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
}

// 🎨 Custom matchers for kid-friendly testing
expect.extend({
    toBeKidFriendly(received) {
        const hasEmojis = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/u.test(received);
        const hasEncouragingWords = /great|awesome|perfect|amazing|wonderful|fantastic|excellent/i.test(received);
        const hasSimpleLanguage = !/\b(deprecated|instantiate|polymorphism|encapsulation)\b/i.test(received);

        const pass = hasEmojis && hasEncouragingWords && hasSimpleLanguage;

        if (pass) {
            return {
                message: () => `Expected "${received}" not to be kid-friendly, but it is! 🎉`,
                pass: true
            };
        } else {
            return {
                message: () => `Expected "${received}" to be kid-friendly (have emojis, encouraging words, and simple language)`,
                pass: false
            };
        }
    }
});

module.exports = {
    TestHelpers
};
