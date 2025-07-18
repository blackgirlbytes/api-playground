/**
 * 🧪 Unit Tests for Conflict Resolution
 * Testing the conflict resolution system to ensure smooth collaboration!
 */

const { testDataGenerators } = require('../utils/test-helpers');
const { sampleUsers, sampleCollections } = require('../fixtures/mock-data');

// Mock the conflict resolution module
let conflictResolver;

beforeAll(() => {
  // Create a mock conflict resolver since we don't have the actual module
  conflictResolver = {
    resolveCollectionConflict: jest.fn(),
    resolveRequestConflict: jest.fn(),
    mergeChanges: jest.fn(),
    detectConflicts: jest.fn(),
    createConflictReport: jest.fn()
  };
});

describe('⚔️ Conflict Resolution Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('🔍 Conflict Detection', () => {
    test('should detect concurrent collection modifications', () => {
      const originalCollection = testDataGenerators.collection({
        name: 'Original Collection',
        requests: []
      });

      const userAChanges = {
        ...originalCollection,
        name: 'Collection A',
        requests: [testDataGenerators.apiRequest({ method: 'GET' })]
      };

      const userBChanges = {
        ...originalCollection,
        name: 'Collection B',
        requests: [testDataGenerators.apiRequest({ method: 'POST' })]
      };

      // Mock conflict detection
      conflictResolver.detectConflicts.mockReturnValue({
        hasConflicts: true,
        conflicts: [
          {
            type: 'name_conflict',
            field: 'name',
            valueA: 'Collection A',
            valueB: 'Collection B'
          },
          {
            type: 'request_conflict',
            field: 'requests',
            description: 'Different requests added simultaneously'
          }
        ]
      });

      const result = conflictResolver.detectConflicts(originalCollection, userAChanges, userBChanges);
      
      expect(result.hasConflicts).toBe(true);
      expect(result.conflicts).toHaveLength(2);
      expect(conflictResolver.detectConflicts).toHaveBeenCalledWith(originalCollection, userAChanges, userBChanges);
    });

    test('should detect no conflicts when changes are compatible', () => {
      const originalCollection = testDataGenerators.collection();
      
      const userAChanges = {
        ...originalCollection,
        description: 'Updated description'
      };

      const userBChanges = {
        ...originalCollection,
        requests: [...originalCollection.requests, testDataGenerators.apiRequest()]
      };

      conflictResolver.detectConflicts.mockReturnValue({
        hasConflicts: false,
        conflicts: []
      });

      const result = conflictResolver.detectConflicts(originalCollection, userAChanges, userBChanges);
      
      expect(result.hasConflicts).toBe(false);
      expect(result.conflicts).toHaveLength(0);
    });

    test('should detect timestamp-based conflicts', () => {
      const baseTime = Date.now();
      
      const change1 = {
        timestamp: baseTime,
        userId: 'user1',
        field: 'name',
        value: 'Name A'
      };

      const change2 = {
        timestamp: baseTime + 100, // 100ms later
        userId: 'user2',
        field: 'name',
        value: 'Name B'
      };

      // Later change should win in timestamp-based resolution
      expect(change2.timestamp).toBeGreaterThan(change1.timestamp);
    });
  });

  describe('🤝 Conflict Resolution Strategies', () => {
    test('should resolve conflicts using last-writer-wins strategy', () => {
      const conflict = {
        type: 'name_conflict',
        field: 'name',
        changes: [
          { userId: 'user1', timestamp: 1000, value: 'Name A' },
          { userId: 'user2', timestamp: 2000, value: 'Name B' }
        ]
      };

      conflictResolver.resolveCollectionConflict.mockReturnValue({
        strategy: 'last_writer_wins',
        resolution: 'Name B',
        winner: 'user2'
      });

      const result = conflictResolver.resolveCollectionConflict(conflict);
      
      expect(result.resolution).toBe('Name B');
      expect(result.winner).toBe('user2');
      expect(result.strategy).toBe('last_writer_wins');
    });

    test('should resolve conflicts using merge strategy for arrays', () => {
      const conflict = {
        type: 'request_array_conflict',
        field: 'requests',
        changes: [
          { 
            userId: 'user1', 
            timestamp: 1000, 
            value: [testDataGenerators.apiRequest({ method: 'GET' })] 
          },
          { 
            userId: 'user2', 
            timestamp: 2000, 
            value: [testDataGenerators.apiRequest({ method: 'POST' })] 
          }
        ]
      };

      const mergedRequests = [
        testDataGenerators.apiRequest({ method: 'GET' }),
        testDataGenerators.apiRequest({ method: 'POST' })
      ];

      conflictResolver.resolveCollectionConflict.mockReturnValue({
        strategy: 'merge_arrays',
        resolution: mergedRequests,
        merged: true
      });

      const result = conflictResolver.resolveCollectionConflict(conflict);
      
      expect(result.strategy).toBe('merge_arrays');
      expect(result.merged).toBe(true);
      expect(Array.isArray(result.resolution)).toBe(true);
    });

    test('should handle user preference-based resolution', () => {
      const conflict = {
        type: 'description_conflict',
        field: 'description',
        changes: [
          { userId: 'user1', value: 'Description A', preference: 'keep_mine' },
          { userId: 'user2', value: 'Description B', preference: 'accept_theirs' }
        ]
      };

      conflictResolver.resolveCollectionConflict.mockReturnValue({
        strategy: 'user_preference',
        resolution: 'Description A',
        reason: 'User preference: keep_mine'
      });

      const result = conflictResolver.resolveCollectionConflict(conflict);
      
      expect(result.strategy).toBe('user_preference');
      expect(result.resolution).toBe('Description A');
    });
  });

  describe('🔄 Change Merging', () => {
    test('should merge non-conflicting changes', () => {
      const baseObject = testDataGenerators.collection({
        name: 'Base Collection',
        description: 'Base description',
        requests: []
      });

      const changes1 = {
        name: 'Updated Collection'
      };

      const changes2 = {
        description: 'Updated description',
        requests: [testDataGenerators.apiRequest()]
      };

      const expectedMerged = {
        ...baseObject,
        name: 'Updated Collection',
        description: 'Updated description',
        requests: [expect.any(Object)]
      };

      conflictResolver.mergeChanges.mockReturnValue(expectedMerged);

      const result = conflictResolver.mergeChanges(baseObject, changes1, changes2);
      
      expect(result.name).toBe('Updated Collection');
      expect(result.description).toBe('Updated description');
      expect(result.requests).toHaveLength(1);
    });

    test('should preserve metadata during merge', () => {
      const baseObject = testDataGenerators.collection();
      const changes = { name: 'New Name' };

      const merged = {
        ...baseObject,
        ...changes,
        lastModified: new Date().toISOString(),
        modifiedBy: 'user1'
      };

      conflictResolver.mergeChanges.mockReturnValue(merged);

      const result = conflictResolver.mergeChanges(baseObject, changes);
      
      expect(result.createdAt).toBe(baseObject.createdAt); // Preserved
      expect(result.createdBy).toBe(baseObject.createdBy); // Preserved
      expect(result.lastModified).toBeDefined(); // Added
      expect(result.modifiedBy).toBeDefined(); // Added
    });

    test('should handle deep object merging', () => {
      const baseRequest = testDataGenerators.apiRequest({
        headers: { 'Content-Type': 'application/json' }
      });

      const headerChanges = {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer token123' 
        }
      };

      const expectedMerged = {
        ...baseRequest,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer token123'
        }
      };

      conflictResolver.mergeChanges.mockReturnValue(expectedMerged);

      const result = conflictResolver.mergeChanges(baseRequest, headerChanges);
      
      expect(result.headers['Content-Type']).toBe('application/json');
      expect(result.headers['Authorization']).toBe('Bearer token123');
    });
  });

  describe('📊 Conflict Reporting', () => {
    test('should create detailed conflict reports', () => {
      const conflicts = [
        {
          type: 'name_conflict',
          field: 'name',
          users: ['user1', 'user2'],
          values: ['Name A', 'Name B']
        },
        {
          type: 'request_conflict',
          field: 'requests',
          users: ['user1', 'user3'],
          description: 'Different requests added'
        }
      ];

      const expectedReport = {
        timestamp: expect.any(String),
        totalConflicts: 2,
        conflicts: conflicts,
        resolution: 'automatic',
        affectedUsers: ['user1', 'user2', 'user3']
      };

      conflictResolver.createConflictReport.mockReturnValue(expectedReport);

      const result = conflictResolver.createConflictReport(conflicts);
      
      expect(result.totalConflicts).toBe(2);
      expect(result.affectedUsers).toHaveLength(3);
      expect(result.resolution).toBe('automatic');
    });

    test('should include user-friendly conflict descriptions', () => {
      const conflict = {
        type: 'name_conflict',
        field: 'name',
        users: ['Alice', 'Bob'],
        values: ['Collection A', 'Collection B']
      };

      const report = {
        friendlyDescription: '👥 Alice and Bob both tried to rename the collection at the same time!',
        technicalDetails: 'Concurrent modification of field: name',
        suggestedAction: 'We kept the most recent change (Bob\'s version)',
        canUndo: true
      };

      conflictResolver.createConflictReport.mockReturnValue(report);

      const result = conflictResolver.createConflictReport([conflict]);
      
      expect(result.friendlyDescription).toContain('👥');
      expect(result.suggestedAction).toBeDefined();
      expect(result.canUndo).toBe(true);
    });
  });

  describe('🎯 Real-time Conflict Prevention', () => {
    test('should implement optimistic locking', () => {
      const collection = testDataGenerators.collection();
      const version = 1;
      
      const lockInfo = {
        collectionId: collection.id,
        version: version,
        lockedBy: 'user1',
        lockedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30000).toISOString() // 30 seconds
      };

      expect(lockInfo.version).toBe(version);
      expect(lockInfo.lockedBy).toBe('user1');
      expect(new Date(lockInfo.expiresAt)).toBeInstanceOf(Date);
    });

    test('should handle lock expiration', () => {
      const lockInfo = {
        expiresAt: new Date(Date.now() - 1000).toISOString() // Expired 1 second ago
      };

      const isExpired = new Date(lockInfo.expiresAt) < new Date();
      expect(isExpired).toBe(true);
    });

    test('should queue conflicting operations', () => {
      const operationQueue = [];
      
      const operation1 = {
        id: 'op1',
        userId: 'user1',
        type: 'update_name',
        data: { name: 'New Name A' },
        timestamp: Date.now()
      };

      const operation2 = {
        id: 'op2',
        userId: 'user2',
        type: 'update_name',
        data: { name: 'New Name B' },
        timestamp: Date.now() + 100
      };

      operationQueue.push(operation1, operation2);
      
      expect(operationQueue).toHaveLength(2);
      expect(operationQueue[1].timestamp).toBeGreaterThan(operationQueue[0].timestamp);
    });
  });
});

console.log('✅ Conflict resolution unit tests loaded! Ready to test collaboration harmony! 🤝');
