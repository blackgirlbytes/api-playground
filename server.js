const WebSocket = require('ws');
const http = require('http');
const https = require('https');
const url = require('url');
const crypto = require('crypto');

// Create HTTP server for WebSocket
const server = http.createServer();
const wss = new WebSocket.Server({ server });

// In-memory storage (in production, use a proper database)
const collections = new Map(); // Shared API collections
const users = new Map(); // Connected users
const requestHistory = new Map(); // API request/response history
const userSessions = new Map(); // User session data

// Utility functions
function generateId() {
    return crypto.randomBytes(16).toString('hex');
}

function createKidFriendlyError(error, context = '') {
    const friendlyMessages = {
        'ENOTFOUND': '🌐 Oops! We couldn\'t find that website. Maybe check if the URL is spelled correctly?',
        'ECONNREFUSED': '🚪 The website said "no visitors allowed right now". They might be taking a break!',
        'ETIMEDOUT': '⏰ The website is taking too long to respond. It might be having a slow day!',
        'CERT_HAS_EXPIRED': '🔒 The website\'s security certificate is old and expired. That\'s not safe!',
        'DEPTH_ZERO_SELF_SIGNED_CERT': '🔒 The website has a homemade security certificate. We can\'t trust it!',
        'UNABLE_TO_VERIFY_LEAF_SIGNATURE': '🔒 We couldn\'t verify the website\'s security. Better be safe!',
        'invalid_json': '📝 The data we got back looks scrambled. The website might have sent us something weird!',
        'network_error': '🌐 Something went wrong with the internet connection. Try again in a moment!',
        'invalid_url': '🔗 That URL doesn\'t look right. Make sure it starts with http:// or https://!',
        'auth_failed': '🔐 The username or password didn\'t work. Double-check your login info!',
        'server_error': '💥 The website had a problem and couldn\'t help us right now.',
        'client_error': '❌ We asked for something the website doesn\'t have or understand.',
        'unknown': '🤔 Something unexpected happened, but don\'t worry - we can try again!'
    };

    let message = friendlyMessages.unknown;
    
    if (error.code && friendlyMessages[error.code]) {
        message = friendlyMessages[error.code];
    } else if (error.message) {
        const errorMsg = error.message.toLowerCase();
        if (errorMsg.includes('json')) {
            message = friendlyMessages.invalid_json;
        } else if (errorMsg.includes('network') || errorMsg.includes('connection')) {
            message = friendlyMessages.network_error;
        } else if (errorMsg.includes('url') || errorMsg.includes('invalid')) {
            message = friendlyMessages.invalid_url;
        } else if (errorMsg.includes('auth') || errorMsg.includes('unauthorized')) {
            message = friendlyMessages.auth_failed;
        } else if (errorMsg.includes('server')) {
            message = friendlyMessages.server_error;
        } else if (errorMsg.includes('client')) {
            message = friendlyMessages.client_error;
        }
    }

    return {
        friendly: message,
        technical: error.message || 'Unknown error',
        context: context
    };
}

function validateUrl(urlString) {
    try {
        const parsedUrl = new URL(urlString);
        return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    } catch {
        return false;
    }
}

function parseBasicAuth(authHeader) {
    if (!authHeader || !authHeader.startsWith('Basic ')) {
        return null;
    }
    
    try {
        const base64Credentials = authHeader.slice(6);
        const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
        const [username, password] = credentials.split(':');
        return { username, password };
    } catch {
        return null;
    }
}

// API Request executor
async function executeApiRequest(requestData) {
    const { method, url: requestUrl, headers = {}, body, auth } = requestData;
    
    // Validate URL
    if (!validateUrl(requestUrl)) {
        throw new Error('invalid_url');
    }

    const parsedUrl = new URL(requestUrl);
    const isHttps = parsedUrl.protocol === 'https:';
    const httpModule = isHttps ? https : http;

    // Prepare headers
    const requestHeaders = { ...headers };
    
    // Add basic auth if provided
    if (auth && auth.type === 'basic' && auth.username && auth.password) {
        const credentials = Buffer.from(`${auth.username}:${auth.password}`).toString('base64');
        requestHeaders['Authorization'] = `Basic ${credentials}`;
    }

    // Add content-type for POST/PUT requests with body
    if ((method === 'POST' || method === 'PUT') && body && !requestHeaders['Content-Type']) {
        requestHeaders['Content-Type'] = 'application/json';
    }

    const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (isHttps ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
        method: method.toUpperCase(),
        headers: requestHeaders,
        timeout: 30000, // 30 second timeout
    };

    return new Promise((resolve, reject) => {
        const req = httpModule.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                let parsedData;
                try {
                    parsedData = JSON.parse(data);
                } catch {
                    parsedData = data; // Keep as string if not valid JSON
                }
                
                resolve({
                    status: res.statusCode,
                    statusText: res.statusMessage,
                    headers: res.headers,
                    data: parsedData,
                    responseTime: Date.now() - startTime
                });
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.on('timeout', () => {
            req.destroy();
            reject(new Error('ETIMEDOUT'));
        });

        const startTime = Date.now();

        // Send body for POST/PUT requests
        if ((method === 'POST' || method === 'PUT') && body) {
            const bodyString = typeof body === 'string' ? body : JSON.stringify(body);
            req.write(bodyString);
        }

        req.end();
    });
}

// Broadcast to all connected clients
function broadcast(message, excludeUserId = null) {
    const messageString = JSON.stringify(message);
    users.forEach((userData, userId) => {
        if (userId !== excludeUserId && userData.ws.readyState === WebSocket.OPEN) {
            userData.ws.send(messageString);
        }
    });
}

// Send message to specific user
function sendToUser(userId, message) {
    const userData = users.get(userId);
    if (userData && userData.ws.readyState === WebSocket.OPEN) {
        userData.ws.send(JSON.stringify(message));
    }
}

// Get online users list
function getOnlineUsers() {
    const onlineUsers = [];
    users.forEach((userData, userId) => {
        onlineUsers.push({
            id: userId,
            name: userData.name,
            joinedAt: userData.joinedAt,
            lastActive: userData.lastActive
        });
    });
    return onlineUsers;
}

// WebSocket connection handler
wss.on('connection', (ws, req) => {
    const userId = generateId();
    console.log(`🎉 New user connected: ${userId}`);

    // Initialize user data
    users.set(userId, {
        ws,
        name: `User ${userId.slice(0, 8)}`,
        joinedAt: new Date().toISOString(),
        lastActive: new Date().toISOString()
    });

    // Send welcome message
    ws.send(JSON.stringify({
        type: 'connection_established',
        userId,
        message: '🎉 Welcome! You\'re now connected to the API collaboration server!'
    }));

    // Broadcast user joined
    broadcast({
        type: 'user_joined',
        user: {
            id: userId,
            name: users.get(userId).name,
            joinedAt: users.get(userId).joinedAt
        },
        onlineUsers: getOnlineUsers()
    }, userId);

    // Handle incoming messages
    ws.on('message', async (data) => {
        try {
            const message = JSON.parse(data);
            users.get(userId).lastActive = new Date().toISOString();

            console.log(`📨 Message from ${userId}:`, message.type);

            switch (message.type) {
                case 'set_user_name':
                    if (message.name && typeof message.name === 'string' && message.name.trim()) {
                        const oldName = users.get(userId).name;
                        users.get(userId).name = message.name.trim();
                        
                        broadcast({
                            type: 'user_name_changed',
                            userId,
                            oldName,
                            newName: message.name.trim(),
                            onlineUsers: getOnlineUsers()
                        });

                        sendToUser(userId, {
                            type: 'name_updated',
                            message: `✅ Your name has been updated to "${message.name.trim()}"!`
                        });
                    }
                    break;

                case 'execute_api_request':
                    try {
                        console.log(`🚀 Executing API request for ${userId}`);
                        
                        const requestId = generateId();
                        const startTime = Date.now();

                        // Validate request data
                        if (!message.request || !message.request.url || !message.request.method) {
                            throw new Error('Missing required request data (url and method)');
                        }

                        // Execute the API request
                        const response = await executeApiRequest(message.request);
                        
                        // Store in history
                        const historyEntry = {
                            id: requestId,
                            request: message.request,
                            response,
                            userId,
                            userName: users.get(userId).name,
                            timestamp: new Date().toISOString(),
                            executionTime: Date.now() - startTime
                        };
                        
                        requestHistory.set(requestId, historyEntry);

                        // Send response to requester
                        sendToUser(userId, {
                            type: 'api_response',
                            requestId,
                            response,
                            message: '✅ API request completed successfully!'
                        });

                        // Broadcast to other users (without full response data for privacy)
                        broadcast({
                            type: 'api_request_executed',
                            requestId,
                            method: message.request.method,
                            url: message.request.url,
                            status: response.status,
                            userId,
                            userName: users.get(userId).name,
                            timestamp: historyEntry.timestamp
                        }, userId);

                    } catch (error) {
                        console.error('API request error:', error);
                        const friendlyError = createKidFriendlyError(error, 'API Request');
                        
                        sendToUser(userId, {
                            type: 'api_error',
                            error: friendlyError,
                            message: '❌ Oops! Something went wrong with your API request.'
                        });
                    }
                    break;

                case 'create_collection':
                    if (message.name && typeof message.name === 'string') {
                        const collectionId = generateId();
                        const collection = {
                            id: collectionId,
                            name: message.name.trim(),
                            description: message.description || '',
                            requests: [],
                            createdBy: userId,
                            createdAt: new Date().toISOString(),
                            collaborators: [userId]
                        };
                        
                        collections.set(collectionId, collection);

                        sendToUser(userId, {
                            type: 'collection_created',
                            collection,
                            message: `🎯 Collection "${collection.name}" created successfully!`
                        });

                        broadcast({
                            type: 'new_collection_available',
                            collection: {
                                id: collection.id,
                                name: collection.name,
                                description: collection.description,
                                createdBy: users.get(userId).name,
                                createdAt: collection.createdAt
                            }
                        }, userId);
                    }
                    break;

                case 'join_collection':
                    if (message.collectionId && collections.has(message.collectionId)) {
                        const collection = collections.get(message.collectionId);
                        
                        if (!collection.collaborators.includes(userId)) {
                            collection.collaborators.push(userId);
                        }

                        sendToUser(userId, {
                            type: 'collection_joined',
                            collection,
                            message: `🤝 You joined the collection "${collection.name}"!`
                        });

                        // Notify other collaborators
                        collection.collaborators.forEach(collaboratorId => {
                            if (collaboratorId !== userId) {
                                sendToUser(collaboratorId, {
                                    type: 'collaborator_joined',
                                    collectionId: collection.id,
                                    user: {
                                        id: userId,
                                        name: users.get(userId).name
                                    }
                                });
                            }
                        });
                    }
                    break;

                case 'add_request_to_collection':
                    if (message.collectionId && message.request && collections.has(message.collectionId)) {
                        const collection = collections.get(message.collectionId);
                        
                        if (collection.collaborators.includes(userId)) {
                            const requestId = generateId();
                            const newRequest = {
                                id: requestId,
                                ...message.request,
                                addedBy: userId,
                                addedAt: new Date().toISOString()
                            };
                            
                            collection.requests.push(newRequest);

                            // Notify all collaborators
                            collection.collaborators.forEach(collaboratorId => {
                                sendToUser(collaboratorId, {
                                    type: 'request_added_to_collection',
                                    collectionId: collection.id,
                                    request: newRequest,
                                    addedBy: users.get(userId).name
                                });
                            });
                        }
                    }
                    break;

                case 'get_collections':
                    const userCollections = [];
                    collections.forEach(collection => {
                        if (collection.collaborators.includes(userId)) {
                            userCollections.push(collection);
                        }
                    });

                    sendToUser(userId, {
                        type: 'collections_list',
                        collections: userCollections
                    });
                    break;

                case 'get_request_history':
                    const userHistory = [];
                    requestHistory.forEach(entry => {
                        if (entry.userId === userId) {
                            userHistory.push(entry);
                        }
                    });

                    sendToUser(userId, {
                        type: 'request_history',
                        history: userHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                    });
                    break;

                case 'get_online_users':
                    sendToUser(userId, {
                        type: 'online_users',
                        users: getOnlineUsers()
                    });
                    break;

                case 'ping':
                    sendToUser(userId, {
                        type: 'pong',
                        timestamp: new Date().toISOString()
                    });
                    break;

                default:
                    sendToUser(userId, {
                        type: 'error',
                        message: '🤔 I don\'t understand that command. Try something else!'
                    });
            }

        } catch (error) {
            console.error('Message handling error:', error);
            const friendlyError = createKidFriendlyError(error, 'Message Processing');
            
            sendToUser(userId, {
                type: 'error',
                error: friendlyError,
                message: '😅 Something went wrong while processing your message.'
            });
        }
    });

    // Handle connection close
    ws.on('close', () => {
        console.log(`👋 User disconnected: ${userId}`);
        
        const userData = users.get(userId);
        if (userData) {
            broadcast({
                type: 'user_left',
                user: {
                    id: userId,
                    name: userData.name
                },
                onlineUsers: getOnlineUsers().filter(user => user.id !== userId)
            });
        }

        users.delete(userId);
    });

    // Handle connection errors
    ws.on('error', (error) => {
        console.error(`❌ WebSocket error for user ${userId}:`, error);
    });
});

// Cleanup function for old data (run every hour)
setInterval(() => {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    
    // Clean up old request history (keep last 1000 entries per user)
    const userHistoryCounts = new Map();
    const sortedHistory = Array.from(requestHistory.entries())
        .sort(([,a], [,b]) => new Date(b.timestamp) - new Date(a.timestamp));
    
    sortedHistory.forEach(([id, entry]) => {
        const count = userHistoryCounts.get(entry.userId) || 0;
        if (count >= 1000) {
            requestHistory.delete(id);
        } else {
            userHistoryCounts.set(entry.userId, count + 1);
        }
    });
    
    console.log('🧹 Cleaned up old data');
}, 60 * 60 * 1000); // Run every hour

// Error handling for the server
server.on('error', (error) => {
    console.error('❌ Server error:', error);
});

// Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`🚀 WebSocket API Collaboration Server is running on port ${PORT}`);
    console.log(`📡 WebSocket endpoint: ws://localhost:${PORT}`);
    console.log(`🎯 Ready to handle API requests and real-time collaboration!`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 Shutting down gracefully...');
    server.close(() => {
        console.log('👋 Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('🛑 Shutting down gracefully...');
    server.close(() => {
        console.log('👋 Server closed');
        process.exit(0);
    });
});
