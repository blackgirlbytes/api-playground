/**
 * 🎭 Mock Data and Fixtures
 * Pre-made test data to make testing easier and more consistent!
 */

/**
 * 👥 Sample users for testing
 */
const sampleUsers = [
  {
    id: 'user_alice',
    name: 'Alice Explorer',
    joinedAt: '2024-01-15T10:30:00.000Z',
    lastActive: '2024-01-15T11:45:00.000Z'
  },
  {
    id: 'user_bob',
    name: 'Bob Builder',
    joinedAt: '2024-01-15T10:35:00.000Z',
    lastActive: '2024-01-15T11:40:00.000Z'
  },
  {
    id: 'user_charlie',
    name: 'Charlie Coder',
    joinedAt: '2024-01-15T10:40:00.000Z',
    lastActive: '2024-01-15T11:35:00.000Z'
  }
];

/**
 * 🌐 Sample API requests for testing
 */
const sampleApiRequests = [
  {
    id: 'req_get_posts',
    method: 'GET',
    url: 'https://jsonplaceholder.typicode.com/posts',
    headers: {
      'Accept': 'application/json'
    },
    description: 'Get all posts'
  },
  {
    id: 'req_get_single_post',
    method: 'GET',
    url: 'https://jsonplaceholder.typicode.com/posts/1',
    headers: {
      'Accept': 'application/json'
    },
    description: 'Get a specific post'
  },
  {
    id: 'req_create_post',
    method: 'POST',
    url: 'https://jsonplaceholder.typicode.com/posts',
    headers: {
      'Content-Type': 'application/json'
    },
    body: {
      title: 'Test Post',
      body: 'This is a test post created during testing',
      userId: 1
    },
    description: 'Create a new post'
  },
  {
    id: 'req_update_post',
    method: 'PUT',
    url: 'https://jsonplaceholder.typicode.com/posts/1',
    headers: {
      'Content-Type': 'application/json'
    },
    body: {
      id: 1,
      title: 'Updated Test Post',
      body: 'This post has been updated',
      userId: 1
    },
    description: 'Update an existing post'
  },
  {
    id: 'req_delete_post',
    method: 'DELETE',
    url: 'https://jsonplaceholder.typicode.com/posts/1',
    description: 'Delete a post'
  }
];

/**
 * 📁 Sample collections for testing
 */
const sampleCollections = [
  {
    id: 'collection_blog_api',
    name: 'Blog API Tests',
    description: 'Testing the blog API endpoints',
    requests: [
      sampleApiRequests[0],
      sampleApiRequests[1],
      sampleApiRequests[2]
    ],
    createdBy: 'user_alice',
    createdAt: '2024-01-15T09:00:00.000Z',
    collaborators: ['user_alice', 'user_bob']
  },
  {
    id: 'collection_user_management',
    name: 'User Management',
    description: 'API calls for managing users',
    requests: [],
    createdBy: 'user_bob',
    createdAt: '2024-01-15T09:30:00.000Z',
    collaborators: ['user_bob', 'user_charlie']
  }
];

/**
 * 📊 Sample API responses for testing
 */
const sampleApiResponses = {
  success: {
    status: 200,
    statusText: 'OK',
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'max-age=43200'
    },
    data: {
      id: 1,
      title: 'Test Post',
      body: 'This is a test response',
      userId: 1
    },
    responseTime: 245
  },
  
  created: {
    status: 201,
    statusText: 'Created',
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'location': '/posts/101'
    },
    data: {
      id: 101,
      title: 'New Post',
      body: 'Newly created post',
      userId: 1
    },
    responseTime: 312
  },
  
  notFound: {
    status: 404,
    statusText: 'Not Found',
    headers: {
      'content-type': 'application/json; charset=utf-8'
    },
    data: {
      error: 'Resource not found'
    },
    responseTime: 156
  },
  
  serverError: {
    status: 500,
    statusText: 'Internal Server Error',
    headers: {
      'content-type': 'application/json; charset=utf-8'
    },
    data: {
      error: 'Internal server error'
    },
    responseTime: 89
  }
};

/**
 * 📝 Sample request history entries
 */
const sampleRequestHistory = [
  {
    id: 'history_1',
    request: sampleApiRequests[0],
    response: sampleApiResponses.success,
    userId: 'user_alice',
    userName: 'Alice Explorer',
    timestamp: '2024-01-15T11:00:00.000Z',
    executionTime: 245
  },
  {
    id: 'history_2',
    request: sampleApiRequests[2],
    response: sampleApiResponses.created,
    userId: 'user_bob',
    userName: 'Bob Builder',
    timestamp: '2024-01-15T11:15:00.000Z',
    executionTime: 312
  },
  {
    id: 'history_3',
    request: sampleApiRequests[1],
    response: sampleApiResponses.notFound,
    userId: 'user_alice',
    userName: 'Alice Explorer',
    timestamp: '2024-01-15T11:30:00.000Z',
    executionTime: 156
  }
];

/**
 * 💬 Sample WebSocket messages for testing
 */
const sampleMessages = {
  // Connection messages
  connectionEstablished: {
    type: 'connection_established',
    userId: 'user_test',
    message: '🎉 Welcome! You\'re now connected to the API collaboration server!'
  },
  
  userJoined: {
    type: 'user_joined',
    user: {
      id: 'user_alice',
      name: 'Alice Explorer',
      joinedAt: '2024-01-15T10:30:00.000Z'
    },
    onlineUsers: sampleUsers
  },
  
  // User management messages
  setUserName: {
    type: 'set_user_name',
    name: 'Test User'
  },
  
  nameUpdated: {
    type: 'name_updated',
    message: '✅ Your name has been updated to "Test User"!'
  },
  
  // API request messages
  executeApiRequest: {
    type: 'execute_api_request',
    request: sampleApiRequests[0]
  },
  
  apiResponse: {
    type: 'api_response',
    requestId: 'req_123',
    response: sampleApiResponses.success,
    message: '✅ API request completed successfully!'
  },
  
  apiError: {
    type: 'api_error',
    error: {
      friendly: '🌐 Oops! We couldn\'t find that website. Maybe check if the URL is spelled correctly?',
      technical: 'ENOTFOUND',
      context: 'API Request'
    },
    message: '❌ Oops! Something went wrong with your API request.'
  },
  
  // Collection messages
  createCollection: {
    type: 'create_collection',
    name: 'Test Collection',
    description: 'A collection for testing'
  },
  
  collectionCreated: {
    type: 'collection_created',
    collection: sampleCollections[0],
    message: '🎯 Collection "Test Collection" created successfully!'
  },
  
  joinCollection: {
    type: 'join_collection',
    collectionId: 'collection_blog_api'
  },
  
  collectionJoined: {
    type: 'collection_joined',
    collection: sampleCollections[0],
    message: '🤝 You joined the collection "Blog API Tests"!'
  }
};

/**
 * 🚨 Sample error scenarios for testing
 */
const sampleErrors = {
  networkTimeout: new Error('ETIMEDOUT'),
  notFound: new Error('ENOTFOUND'),
  connectionRefused: new Error('ECONNREFUSED'),
  invalidJson: new Error('Unexpected token in JSON'),
  invalidUrl: new Error('Invalid URL'),
  authFailed: new Error('Authentication failed')
};

// Add error codes to make them more realistic
sampleErrors.networkTimeout.code = 'ETIMEDOUT';
sampleErrors.notFound.code = 'ENOTFOUND';
sampleErrors.connectionRefused.code = 'ECONNREFUSED';

/**
 * 🎯 Test scenarios - complete workflows for testing
 */
const testScenarios = {
  /**
   * Basic user connection and setup
   */
  userConnection: {
    steps: [
      { action: 'connect', expected: 'connection_established' },
      { action: 'setName', data: 'Test User', expected: 'name_updated' },
      { action: 'getOnlineUsers', expected: 'online_users' }
    ]
  },
  
  /**
   * API request execution workflow
   */
  apiRequestExecution: {
    steps: [
      { action: 'connect', expected: 'connection_established' },
      { action: 'executeRequest', data: sampleApiRequests[0], expected: 'api_response' },
      { action: 'getHistory', expected: 'request_history' }
    ]
  },
  
  /**
   * Collection management workflow
   */
  collectionManagement: {
    steps: [
      { action: 'connect', expected: 'connection_established' },
      { action: 'createCollection', data: { name: 'Test Collection' }, expected: 'collection_created' },
      { action: 'addRequest', data: { collectionId: 'test', request: sampleApiRequests[0] }, expected: 'request_added_to_collection' },
      { action: 'getCollections', expected: 'collections_list' }
    ]
  },
  
  /**
   * Multi-user collaboration workflow
   */
  multiUserCollaboration: {
    users: 2,
    steps: [
      { user: 0, action: 'connect', expected: 'connection_established' },
      { user: 1, action: 'connect', expected: 'connection_established' },
      { user: 0, action: 'createCollection', data: { name: 'Shared Collection' }, expected: 'collection_created' },
      { user: 1, action: 'joinCollection', data: { collectionId: 'shared' }, expected: 'collection_joined' },
      { user: 0, action: 'addRequest', data: { collectionId: 'shared', request: sampleApiRequests[0] }, expected: 'request_added_to_collection' },
      { user: 1, action: 'executeRequest', data: sampleApiRequests[0], expected: 'api_response' }
    ]
  }
};

module.exports = {
  sampleUsers,
  sampleApiRequests,
  sampleCollections,
  sampleApiResponses,
  sampleRequestHistory,
  sampleMessages,
  sampleErrors,
  testScenarios
};
