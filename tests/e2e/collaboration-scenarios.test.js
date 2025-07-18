/**
 * 🎯 End-to-End Tests for Multi-User Collaboration Scenarios
 * Testing complex team collaboration workflows in realistic scenarios!
 */

const { 
  createMockWebSocketServer, 
  createTestWebSocketClient, 
  waitForMessage, 
  findMessage,
  testDataGenerators,
  messageBuilders 
} = require('../utils/test-helpers');

describe('🤝 Multi-User Collaboration Scenarios E2E Tests', () => {
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

  describe('🏢 Team Development Scenarios', () => {
    test('should simulate complete agile team API development workflow', async () => {
      // Team roles: Product Owner, Developer, QA Tester, DevOps
      const teamMembers = [
        { name: 'Alice Product Owner', role: 'PO' },
        { name: 'Bob Developer', role: 'DEV' },
        { name: 'Charlie QA Tester', role: 'QA' },
        { name: 'Diana DevOps', role: 'DEVOPS' }
      ];
      
      const team = [];
      
      // Step 1: Team members join the collaboration platform
      for (const member of teamMembers) {
        const client = await createTestWebSocketClient(mockServer.url);
        client.send(messageBuilders.setUserName(member.name));
        team.push({ client, ...member });
        clients.push(client);
      }
      
      await waitFor(300);
      
      // Step 2: Product Owner creates project collection
      const po = team.find(m => m.role === 'PO');
      po.client.send(messageBuilders.createCollection(
        'User Management API v2.0',
        'API endpoints for user registration, authentication, and profile management'
      ));
      
      await waitFor(200);
      
      const projectCollection = findMessage(po.client.messages, 'collection_created');
      const collectionId = projectCollection?.parsed?.collection?.id;
      expect(collectionId).toBeDefined();
      
      // Step 3: All team members join the project collection
      for (const member of team.filter(m => m.role !== 'PO')) {
        member.client.send(messageBuilders.joinCollection(collectionId));
      }
      
      await waitFor(300);
      
      // Step 4: Product Owner defines API requirements
      const apiRequirements = [
        {
          name: 'User Registration',
          request: testDataGenerators.apiRequest({
            method: 'POST',
            url: 'https://api.example.com/v2/users/register',
            headers: { 'Content-Type': 'application/json' },
            body: {
              username: 'newuser',
              email: 'user@example.com',
              password: 'securepassword123'
            },
            description: 'Register a new user account'
          })
        },
        {
          name: 'User Login',
          request: testDataGenerators.apiRequest({
            method: 'POST',
            url: 'https://api.example.com/v2/auth/login',
            headers: { 'Content-Type': 'application/json' },
            body: {
              username: 'newuser',
              password: 'securepassword123'
            },
            description: 'Authenticate user and get access token'
          })
        },
        {
          name: 'Get User Profile',
          request: testDataGenerators.apiRequest({
            method: 'GET',
            url: 'https://api.example.com/v2/users/profile',
            headers: { 
              'Authorization': 'Bearer jwt-token-here',
              'Accept': 'application/json'
            },
            description: 'Get authenticated user profile'
          })
        }
      ];
      
      // PO adds all requirements to collection
      for (const requirement of apiRequirements) {
        po.client.send(messageBuilders.addRequestToCollection(collectionId, requirement.request));
        await waitFor(150);
      }
      
      // Step 5: Developer tests the API endpoints
      const developer = team.find(m => m.role === 'DEV');
      
      // Developer executes registration endpoint (using mock endpoint)
      const testRegistration = testDataGenerators.apiRequest({
        method: 'POST',
        url: 'https://jsonplaceholder.typicode.com/posts', // Mock endpoint
        headers: { 'Content-Type': 'application/json' },
        body: { title: 'User Registration Test', body: 'Testing user registration', userId: 1 }
      });
      
      developer.client.send(messageBuilders.executeApiRequest(testRegistration));
      await waitFor(1000);
      
      // Step 6: QA Tester validates the API responses
      const qaTester = team.find(m => m.role === 'QA');
      
      // QA executes test cases
      const qaTestCases = [
        testDataGenerators.apiRequest({
          method: 'GET',
          url: 'https://jsonplaceholder.typicode.com/users/1',
          description: 'QA: Validate user data structure'
        }),
        testDataGenerators.apiRequest({
          method: 'GET',
          url: 'https://jsonplaceholder.typicode.com/posts/1',
          description: 'QA: Test error handling'
        })
      ];
      
      for (const testCase of qaTestCases) {
        qaTester.client.send(messageBuilders.executeApiRequest(testCase));
        await waitFor(800);
      }
      
      // Step 7: DevOps monitors API performance
      const devops = team.find(m => m.role === 'DEVOPS');
      
      // DevOps checks request history for performance metrics
      devops.client.send({ type: 'get_request_history' });
      await waitFor(200);
      
      const performanceHistory = findMessage(devops.client.messages, 'request_history');
      expect(performanceHistory).toBeDefined();
      
      // Step 8: Team collaboration verification
      // All team members should have received notifications about each other's work
      team.forEach(member => {
        const executionNotifications = member.client.messages.filter(msg => 
          msg.parsed && msg.parsed.type === 'api_request_executed'
        );
        expect(executionNotifications.length).toBeGreaterThan(0);
      });
      
      // Step 9: Final project state verification
      team.forEach(member => {
        member.client.send({ type: 'get_collections' });
      });
      
      await waitFor(300);
      
      // All team members should have consistent project state
      team.forEach(member => {
        const collections = findMessage(member.client.messages, 'collections_list');
        const project = collections?.parsed?.collections?.find(c => c.id === collectionId);
        
        expect(project).toBeDefined();
        expect(project?.name).toBe('User Management API v2.0');
        expect(project?.collaborators?.length).toBe(4);
        expect(project?.requests?.length).toBe(3); // Original requirements
      });
    });

    test('should handle distributed team across time zones', async () => {
      // Simulate team members joining at different times (async collaboration)
      const timeZones = [
        { name: 'Alice PST', delay: 0 },
        { name: 'Bob EST', delay: 200 },
        { name: 'Charlie GMT', delay: 400 },
        { name: 'Diana JST', delay: 600 }
      ];
      
      const distributedTeam = [];
      
      // Members join at different times
      for (const member of timeZones) {
        setTimeout(async () => {
          const client = await createTestWebSocketClient(mockServer.url);
          client.send(messageBuilders.setUserName(member.name));
          distributedTeam.push({ client, ...member });
          clients.push(client);
        }, member.delay);
      }
      
      await waitFor(1000); // Wait for all members to join
      
      // First member creates global project
      if (distributedTeam.length > 0) {
        distributedTeam[0].client.send(messageBuilders.createCollection(
          'Global API Project',
          'Cross-timezone collaboration project'
        ));
        
        await waitFor(200);
        
        const globalProject = findMessage(distributedTeam[0].client.messages, 'collection_created');
        const collectionId = globalProject?.parsed?.collection?.id;
        
        if (collectionId) {
          // Other members join as they come online
          for (let i = 1; i < distributedTeam.length; i++) {
            setTimeout(() => {
              distributedTeam[i].client.send(messageBuilders.joinCollection(collectionId));
            }, i * 100);
          }
          
          await waitFor(500);
          
          // Each member contributes when they're active
          distributedTeam.forEach((member, index) => {
            setTimeout(() => {
              const request = testDataGenerators.apiRequest({
                method: 'GET',
                url: `https://jsonplaceholder.typicode.com/posts/${index + 1}`,
                description: `Contribution from ${member.name}`
              });
              
              member.client.send(messageBuilders.addRequestToCollection(collectionId, request));
            }, index * 150);
          });
          
          await waitFor(1000);
          
          // Verify asynchronous collaboration worked
          distributedTeam.forEach(member => {
            const addedMessages = member.client.messages.filter(msg => 
              msg.parsed && msg.parsed.type === 'request_added_to_collection'
            );
            expect(addedMessages.length).toBeGreaterThan(0);
          });
        }
      }
    });

    test('should handle large team collaboration (10+ members)', async () => {
      const teamSize = 12;
      const largeTeam = [];
      
      // Create large team
      for (let i = 0; i < teamSize; i++) {
        const client = await createTestWebSocketClient(mockServer.url);
        client.send(messageBuilders.setUserName(`TeamMember${i + 1}`));
        largeTeam.push({ client, id: i + 1 });
        clients.push(client);
      }
      
      await waitFor(500);
      
      // Team lead creates main project
      const teamLead = largeTeam[0];
      teamLead.client.send(messageBuilders.createCollection(
        'Large Team API Project',
        'Collaboration project for large development team'
      ));
      
      await waitFor(200);
      
      const mainProject = findMessage(teamLead.client.messages, 'collection_created');
      const collectionId = mainProject?.parsed?.collection?.id;
      
      if (collectionId) {
        // All team members join
        for (let i = 1; i < largeTeam.length; i++) {
          largeTeam[i].client.send(messageBuilders.joinCollection(collectionId));
          await waitFor(50); // Small delay to prevent overwhelming
        }
        
        await waitFor(500);
        
        // Team members work in parallel
        const parallelWork = largeTeam.map((member, index) => {
          return new Promise((resolve) => {
            setTimeout(() => {
              const request = testDataGenerators.apiRequest({
                method: ['GET', 'POST', 'PUT', 'DELETE'][index % 4],
                url: `https://jsonplaceholder.typicode.com/posts/${index + 1}`,
                description: `Work by ${member.id}`
              });
              
              member.client.send(messageBuilders.addRequestToCollection(collectionId, request));
              resolve();
            }, Math.random() * 200); // Random timing to simulate real work
          });
        });
        
        await Promise.all(parallelWork);
        await waitFor(1000);
        
        // Verify system handled large team collaboration
        largeTeam.forEach(member => {
          member.client.send({ type: 'get_collections' });
        });
        
        await waitFor(500);
        
        // All members should have consistent state
        let consistentStateCount = 0;
        largeTeam.forEach(member => {
          const collections = findMessage(member.client.messages, 'collections_list');
          const project = collections?.parsed?.collections?.find(c => c.id === collectionId);
          
          if (project && project.collaborators?.length === teamSize) {
            consistentStateCount++;
          }
        });
        
        // Most members should have consistent state (allowing for some timing variations)
        expect(consistentStateCount).toBeGreaterThan(teamSize * 0.8);
      }
    });
  });

  describe('🔄 Real-world Collaboration Patterns', () => {
    test('should simulate code review workflow with API testing', async () => {
      const reviewTeam = [
        { name: 'Alice Author', role: 'AUTHOR' },
        { name: 'Bob Reviewer', role: 'REVIEWER' },
        { name: 'Charlie Approver', role: 'APPROVER' }
      ];
      
      const team = [];
      
      for (const member of reviewTeam) {
        const client = await createTestWebSocketClient(mockServer.url);
        client.send(messageBuilders.setUserName(member.name));
        team.push({ client, ...member });
        clients.push(client);
      }
      
      await waitFor(200);
      
      // Author creates PR collection
      const author = team.find(m => m.role === 'AUTHOR');
      author.client.send(messageBuilders.createCollection(
        'PR-123: Add User Authentication API',
        'API endpoints for user authentication feature'
      ));
      
      await waitFor(200);
      
      const prCollection = findMessage(author.client.messages, 'collection_created');
      const collectionId = prCollection?.parsed?.collection?.id;
      
      // Reviewer and approver join
      const reviewer = team.find(m => m.role === 'REVIEWER');
      const approver = team.find(m => m.role === 'APPROVER');
      
      reviewer.client.send(messageBuilders.joinCollection(collectionId));
      approver.client.send(messageBuilders.joinCollection(collectionId));
      
      await waitFor(200);
      
      // Author adds API endpoints for review
      const authEndpoints = [
        testDataGenerators.apiRequest({
          method: 'POST',
          url: 'https://api.example.com/auth/login',
          body: { username: 'test', password: 'test123' },
          description: 'Login endpoint'
        }),
        testDataGenerators.apiRequest({
          method: 'POST',
          url: 'https://api.example.com/auth/logout',
          headers: { 'Authorization': 'Bearer token' },
          description: 'Logout endpoint'
        })
      ];
      
      for (const endpoint of authEndpoints) {
        author.client.send(messageBuilders.addRequestToCollection(collectionId, endpoint));
        await waitFor(100);
      }
      
      // Reviewer tests the endpoints
      for (const endpoint of authEndpoints) {
        // Use mock endpoint for testing
        const testEndpoint = testDataGenerators.apiRequest({
          method: endpoint.method,
          url: 'https://jsonplaceholder.typicode.com/posts',
          body: endpoint.body,
          description: `Review test: ${endpoint.description}`
        });
        
        reviewer.client.send(messageBuilders.executeApiRequest(testEndpoint));
        await waitFor(800);
      }
      
      // Approver does final validation
      const validationRequest = testDataGenerators.apiRequest({
        method: 'GET',
        url: 'https://jsonplaceholder.typicode.com/posts/1',
        description: 'Final approval validation'
      });
      
      approver.client.send(messageBuilders.executeApiRequest(validationRequest));
      await waitFor(800);
      
      // Verify review workflow
      team.forEach(member => {
        const notifications = member.client.messages.filter(msg => 
          msg.parsed && (
            msg.parsed.type === 'request_added_to_collection' ||
            msg.parsed.type === 'api_request_executed'
          )
        );
        expect(notifications.length).toBeGreaterThan(0);
      });
    });

    test('should handle hotfix collaboration scenario', async () => {
      const hotfixTeam = [
        { name: 'Alice OnCall', role: 'ONCALL' },
        { name: 'Bob Support', role: 'SUPPORT' },
        { name: 'Charlie Lead', role: 'LEAD' }
      ];
      
      const team = [];
      
      for (const member of hotfixTeam) {
        const client = await createTestWebSocketClient(mockServer.url);
        client.send(messageBuilders.setUserName(member.name));
        team.push({ client, ...member });
        clients.push(client);
      }
      
      await waitFor(200);
      
      // On-call engineer creates urgent hotfix collection
      const onCall = team.find(m => m.role === 'ONCALL');
      onCall.client.send(messageBuilders.createCollection(
        'HOTFIX: Critical API Issue',
        'Emergency fix for production API failure'
      ));
      
      await waitFor(200);
      
      const hotfixCollection = findMessage(onCall.client.messages, 'collection_created');
      const collectionId = hotfixCollection?.parsed?.collection?.id;
      
      // Support and lead join immediately
      const support = team.find(m => m.role === 'SUPPORT');
      const lead = team.find(m => m.role === 'LEAD');
      
      support.client.send(messageBuilders.joinCollection(collectionId));
      lead.client.send(messageBuilders.joinCollection(collectionId));
      
      await waitFor(200);
      
      // Rapid testing of critical endpoints
      const criticalEndpoints = [
        testDataGenerators.apiRequest({
          method: 'GET',
          url: 'https://jsonplaceholder.typicode.com/posts/1',
          description: 'Test main API endpoint'
        }),
        testDataGenerators.apiRequest({
          method: 'GET',
          url: 'https://jsonplaceholder.typicode.com/users/1',
          description: 'Test user service'
        })
      ];
      
      // All team members test simultaneously (emergency scenario)
      team.forEach((member, index) => {
        if (index < criticalEndpoints.length) {
          member.client.send(messageBuilders.executeApiRequest(criticalEndpoints[index]));
        }
      });
      
      await waitFor(1500);
      
      // Verify rapid response collaboration
      team.forEach(member => {
        const responses = member.client.messages.filter(msg => 
          msg.parsed && (
            msg.parsed.type === 'api_response' ||
            msg.parsed.type === 'api_request_executed'
          )
        );
        expect(responses.length).toBeGreaterThan(0);
      });
    });

    test('should simulate cross-functional team API design session', async () => {
      const designTeam = [
        { name: 'Alice Frontend', role: 'FRONTEND' },
        { name: 'Bob Backend', role: 'BACKEND' },
        { name: 'Charlie Mobile', role: 'MOBILE' },
        { name: 'Diana UX', role: 'UX' }
      ];
      
      const team = [];
      
      for (const member of designTeam) {
        const client = await createTestWebSocketClient(mockServer.url);
        client.send(messageBuilders.setUserName(member.name));
        team.push({ client, ...member });
        clients.push(client);
      }
      
      await waitFor(300);
      
      // UX designer initiates design session
      const ux = team.find(m => m.role === 'UX');
      ux.client.send(messageBuilders.createCollection(
        'API Design Session: Shopping Cart',
        'Collaborative design of shopping cart API'
      ));
      
      await waitFor(200);
      
      const designSession = findMessage(ux.client.messages, 'collection_created');
      const collectionId = designSession?.parsed?.collection?.id;
      
      // All team members join design session
      for (const member of team.filter(m => m.role !== 'UX')) {
        member.client.send(messageBuilders.joinCollection(collectionId));
      }
      
      await waitFor(300);
      
      // Each role contributes their perspective
      const contributions = [
        {
          role: 'FRONTEND',
          request: testDataGenerators.apiRequest({
            method: 'GET',
            url: 'https://api.example.com/cart',
            description: 'Frontend: Get cart contents for display'
          })
        },
        {
          role: 'BACKEND',
          request: testDataGenerators.apiRequest({
            method: 'POST',
            url: 'https://api.example.com/cart/items',
            body: { productId: 123, quantity: 2 },
            description: 'Backend: Add item to cart'
          })
        },
        {
          role: 'MOBILE',
          request: testDataGenerators.apiRequest({
            method: 'PUT',
            url: 'https://api.example.com/cart/items/123',
            body: { quantity: 3 },
            description: 'Mobile: Update item quantity'
          })
        }
      ];
      
      // Team members add their contributions
      contributions.forEach(contribution => {
        const member = team.find(m => m.role === contribution.role);
        if (member) {
          member.client.send(messageBuilders.addRequestToCollection(collectionId, contribution.request));
        }
      });
      
      await waitFor(500);
      
      // Team tests the proposed API design
      team.forEach((member, index) => {
        if (index < contributions.length) {
          // Use mock endpoint for testing
          const testRequest = testDataGenerators.apiRequest({
            method: contributions[index].request.method,
            url: 'https://jsonplaceholder.typicode.com/posts',
            description: `${member.role} testing: ${contributions[index].request.description}`
          });
          
          member.client.send(messageBuilders.executeApiRequest(testRequest));
        }
      });
      
      await waitFor(1500);
      
      // Verify collaborative design process
      team.forEach(member => {
        member.client.send({ type: 'get_collections' });
      });
      
      await waitFor(300);
      
      // All team members should have the complete design
      team.forEach(member => {
        const collections = findMessage(member.client.messages, 'collections_list');
        const designCollection = collections?.parsed?.collections?.find(c => c.id === collectionId);
        
        expect(designCollection).toBeDefined();
        expect(designCollection?.requests?.length).toBe(3);
        expect(designCollection?.collaborators?.length).toBe(4);
      });
    });
  });

  describe('🌐 Global Collaboration Scenarios', () => {
    test('should handle 24/7 global development workflow', async () => {
      // Simulate follow-the-sun development
      const globalTeam = [
        { name: 'Alice US West', timezone: 'PST', shift: 0 },
        { name: 'Bob US East', timezone: 'EST', shift: 100 },
        { name: 'Charlie Europe', timezone: 'GMT', shift: 200 },
        { name: 'Diana Asia', timezone: 'JST', shift: 300 }
      ];
      
      const team = [];
      
      // Team members join in sequence (following the sun)
      for (const member of globalTeam) {
        setTimeout(async () => {
          const client = await createTestWebSocketClient(mockServer.url);
          client.send(messageBuilders.setUserName(member.name));
          team.push({ client, ...member });
          clients.push(client);
        }, member.shift);
      }
      
      await waitFor(500);
      
      // First team member creates global project
      if (team.length > 0) {
        team[0].client.send(messageBuilders.createCollection(
          'Global API Development',
          '24/7 continuous development project'
        ));
        
        await waitFor(200);
        
        const globalProject = findMessage(team[0].client.messages, 'collection_created');
        const collectionId = globalProject?.parsed?.collection?.id;
        
        if (collectionId) {
          // Each team member joins and contributes during their shift
          for (let i = 1; i < team.length; i++) {
            setTimeout(() => {
              team[i].client.send(messageBuilders.joinCollection(collectionId));
              
              // Add work during their shift
              setTimeout(() => {
                const shiftWork = testDataGenerators.apiRequest({
                  method: 'GET',
                  url: `https://jsonplaceholder.typicode.com/posts/${i + 1}`,
                  description: `${team[i].timezone} shift contribution`
                });
                
                team[i].client.send(messageBuilders.addRequestToCollection(collectionId, shiftWork));
              }, 100);
            }, i * 100);
          }
          
          await waitFor(1000);
          
          // Verify continuous development workflow
          team.forEach(member => {
            const workMessages = member.client.messages.filter(msg => 
              msg.parsed && msg.parsed.type === 'request_added_to_collection'
            );
            expect(workMessages.length).toBeGreaterThan(0);
          });
        }
      }
    });
  });
});

console.log('✅ Multi-user collaboration scenarios E2E tests loaded! Ready to test teamwork at scale! 🤝🌍');
