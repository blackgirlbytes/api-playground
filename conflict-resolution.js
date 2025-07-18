/**
 * 🤝 Conflict Resolution System for Kid-Friendly API Testing Platform
 * Handles real-time collaborative editing with fun explanations!
 */

class ConflictResolver {
    constructor() {
        this.operations = [];
        this.version = 0;
        this.locks = new Map();
        this.pendingOperations = [];
    }

    /**
     * 🎯 Apply Operational Transform for real-time collaboration
     * Like when two kids try to write on the same paper at the same time!
     */
    applyOperation(operation, userId) {
        const transformedOp = this.transformOperation(operation);
        
        // Kid-friendly logging
        console.log(`🎨 ${userId} is making changes like an artist painting on a shared canvas!`);
        
        this.operations.push({
            ...transformedOp,
            userId,
            timestamp: Date.now(),
            version: this.version++
        });

        return transformedOp;
    }

    /**
     * 🔄 Transform operations to avoid conflicts
     * Like taking turns on a playground swing!
     */
    transformOperation(operation) {
        // Simple operational transform for text editing
        let transformedOp = { ...operation };
        
        for (let pendingOp of this.pendingOperations) {
            if (this.operationsConflict(transformedOp, pendingOp)) {
                transformedOp = this.resolveConflict(transformedOp, pendingOp);
            }
        }

        return transformedOp;
    }

    /**
     * 🕵️ Check if two operations conflict
     * Like checking if two kids want the same toy!
     */
    operationsConflict(op1, op2) {
        if (op1.type === 'edit' && op2.type === 'edit') {
            // Check if they're editing the same field
            return op1.field === op2.field && 
                   Math.abs(op1.position - op2.position) < 10;
        }
        return false;
    }

    /**
     * 🤝 Resolve conflicts between operations
     * Like helping kids share and take turns!
     */
    resolveConflict(op1, op2) {
        const resolution = {
            ...op1,
            resolvedConflict: true,
            originalOperation: { ...op1 },
            conflictedWith: op2.userId,
            resolution: 'merged'
        };

        // Adjust position if needed (like making space for both kids)
        if (op1.position <= op2.position) {
            resolution.position = op2.position + (op2.text ? op2.text.length : 0);
        }

        console.log(`🤝 Conflict resolved! ${op1.userId} and ${op2.userId} are now working together like best friends!`);
        
        return resolution;
    }

    /**
     * 🔒 Lock a resource for critical operations
     * Like putting a "Reserved" sign on a library book!
     */
    acquireLock(resourceId, userId, timeout = 30000) {
        if (this.locks.has(resourceId)) {
            const lock = this.locks.get(resourceId);
            if (lock.userId !== userId && Date.now() - lock.timestamp < timeout) {
                return {
                    success: false,
                    message: `🚧 Oops! ${lock.userId} is currently working on this. It's like waiting for your turn on the computer! Try again in a moment.`,
                    waitTime: Math.ceil((timeout - (Date.now() - lock.timestamp)) / 1000)
                };
            }
        }

        this.locks.set(resourceId, {
            userId,
            timestamp: Date.now(),
            timeout
        });

        console.log(`🔒 ${userId} got the magic key to work on ${resourceId}!`);
        
        return {
            success: true,
            message: `🎉 You've got the green light to make changes! You're like the captain of this ship now!`
        };
    }

    /**
     * 🔓 Release a lock
     * Like returning a library book so others can use it!
     */
    releaseLock(resourceId, userId) {
        const lock = this.locks.get(resourceId);
        if (lock && lock.userId === userId) {
            this.locks.delete(resourceId);
            console.log(`🔓 ${userId} finished their work and passed the baton to the next person!`);
            return true;
        }
        return false;
    }

    /**
     * 📚 Get operation history
     * Like looking at all the drawings everyone made on a shared art project!
     */
    getHistory(limit = 50) {
        return this.operations
            .slice(-limit)
            .map(op => ({
                ...op,
                friendlyDescription: this.getFriendlyDescription(op)
            }));
    }

    /**
     * 🎨 Get kid-friendly description of operations
     */
    getFriendlyDescription(operation) {
        const actions = {
            'edit': '✏️ made some edits',
            'add': '➕ added something new',
            'delete': '🗑️ removed something',
            'test': '🧪 ran a test',
            'save': '💾 saved their work'
        };

        const action = actions[operation.type] || '🎯 did something cool';
        return `${operation.userId} ${action} at ${new Date(operation.timestamp).toLocaleTimeString()}`;
    }

    /**
     * 🔄 Merge conflicting versions
     * Like combining two different drawings into one masterpiece!
     */
    mergeVersions(version1, version2, userId) {
        const merged = {
            ...version1,
            mergedAt: Date.now(),
            mergedBy: userId,
            originalVersions: [version1, version2],
            conflicts: []
        };

        // Simple merge strategy - keep both changes when possible
        for (let key in version2) {
            if (version1[key] !== version2[key]) {
                if (typeof version1[key] === 'string' && typeof version2[key] === 'string') {
                    // Merge strings by combining them
                    merged[key] = `${version1[key]}\n${version2[key]}`;
                    merged.conflicts.push({
                        field: key,
                        resolution: 'combined',
                        message: `🤝 Combined both versions like mixing two colors to make a new one!`
                    });
                } else {
                    // For other types, prefer the newer version
                    merged[key] = version2[key];
                    merged.conflicts.push({
                        field: key,
                        resolution: 'newer_version',
                        message: `🆕 Used the newer version like choosing the latest toy model!`
                    });
                }
            }
        }

        console.log(`🎨 ${userId} created a beautiful merged version with ${merged.conflicts.length} conflicts resolved!`);
        
        return merged;
    }

    /**
     * 🧹 Clean up old operations and locks
     * Like tidying up the classroom at the end of the day!
     */
    cleanup() {
        const now = Date.now();
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours

        // Clean old operations
        this.operations = this.operations.filter(op => 
            now - op.timestamp < maxAge
        );

        // Clean expired locks
        for (let [resourceId, lock] of this.locks.entries()) {
            if (now - lock.timestamp > lock.timeout) {
                this.locks.delete(resourceId);
                console.log(`🧹 Cleaned up expired lock for ${resourceId} - it's available again!`);
            }
        }

        console.log(`🧹 Cleanup complete! Everything is neat and tidy like a well-organized toy box!`);
    }
}

/**
 * 🎨 Response Formatter - Makes API responses kid-friendly!
 */
class ResponseFormatter {
    constructor() {
        this.statusMessages = {
            200: { emoji: '🎉', message: 'Success! Your request worked perfectly like a magic spell!' },
            201: { emoji: '✨', message: 'Created! You made something new like building with LEGO blocks!' },
            400: { emoji: '🤔', message: 'Oops! The request was confusing like asking for pizza with impossible toppings!' },
            401: { emoji: '🔐', message: 'Access denied! You need the secret password like entering a clubhouse!' },
            404: { emoji: '🔍', message: 'Not found! It\'s like looking for a toy that\'s not in the toy box!' },
            500: { emoji: '🛠️', message: 'Server error! The computer had a hiccup like when a robot needs fixing!' }
        };
    }

    /**
     * 🌈 Format API response for kids
     */
    formatResponse(response, requestTime) {
        const status = this.statusMessages[response.status] || 
                      { emoji: '❓', message: 'Something happened! Let\'s figure out what it means together!' };

        const formattedResponse = {
            success: response.status >= 200 && response.status < 300,
            status: {
                code: response.status,
                ...status
            },
            timing: this.formatTiming(requestTime),
            size: this.formatSize(JSON.stringify(response.data).length),
            data: this.formatData(response.data),
            headers: this.formatHeaders(response.headers),
            kidFriendlyExplanation: this.explainResponse(response)
        };

        return formattedResponse;
    }

    /**
     * ⏱️ Format response timing
     */
    formatTiming(milliseconds) {
        if (milliseconds < 100) {
            return {
                ms: milliseconds,
                description: '⚡ Lightning fast! Quicker than blinking!',
                emoji: '⚡'
            };
        } else if (milliseconds < 1000) {
            return {
                ms: milliseconds,
                description: '🏃 Pretty quick! Like running to the ice cream truck!',
                emoji: '🏃'
            };
        } else {
            return {
                ms: milliseconds,
                description: '🐌 A bit slow, like waiting for cookies to bake!',
                emoji: '🐌'
            };
        }
    }

    /**
     * 📏 Format response size
     */
    formatSize(bytes) {
        if (bytes < 1024) {
            return {
                bytes,
                description: `📄 Tiny! Like a short note (${bytes} bytes)`,
                emoji: '📄'
            };
        } else if (bytes < 1024 * 1024) {
            const kb = Math.round(bytes / 1024);
            return {
                bytes,
                kb,
                description: `📋 Medium size! Like a school essay (${kb} KB)`,
                emoji: '📋'
            };
        } else {
            const mb = Math.round(bytes / (1024 * 1024));
            return {
                bytes,
                mb,
                description: `📚 Big! Like a whole book (${mb} MB)`,
                emoji: '📚'
            };
        }
    }

    /**
     * 🎨 Format response data with highlights
     */
    formatData(data) {
        if (typeof data === 'string') {
            return {
                type: 'text',
                content: data,
                highlights: this.findInterestingParts(data)
            };
        } else if (typeof data === 'object') {
            return {
                type: 'object',
                content: data,
                highlights: this.findInterestingFields(data),
                summary: this.summarizeObject(data)
            };
        }
        
        return {
            type: typeof data,
            content: data,
            highlights: []
        };
    }

    /**
     * 🔍 Find interesting parts in text
     */
    findInterestingParts(text) {
        const highlights = [];
        
        // Look for numbers
        const numbers = text.match(/\d+/g);
        if (numbers) {
            highlights.push({
                type: 'numbers',
                emoji: '🔢',
                description: `Found ${numbers.length} numbers! Numbers are like counting your toys!`
            });
        }

        // Look for URLs
        const urls = text.match(/https?:\/\/[^\s]+/g);
        if (urls) {
            highlights.push({
                type: 'urls',
                emoji: '🔗',
                description: `Found ${urls.length} web links! Like addresses to visit on the internet!`
            });
        }

        return highlights;
    }

    /**
     * 🎯 Find interesting fields in objects
     */
    findInterestingFields(obj) {
        const highlights = [];
        
        if (obj.id) {
            highlights.push({
                field: 'id',
                emoji: '🏷️',
                description: 'This has an ID number! Like a name tag for data!'
            });
        }

        if (obj.name || obj.title) {
            highlights.push({
                field: 'name/title',
                emoji: '📛',
                description: 'This has a name! Like how you have a name!'
            });
        }

        if (obj.date || obj.timestamp || obj.created_at) {
            highlights.push({
                field: 'date',
                emoji: '📅',
                description: 'This has a date! Like marking your calendar!'
            });
        }

        return highlights;
    }

    /**
     * 📊 Summarize object data
     */
    summarizeObject(obj) {
        const keys = Object.keys(obj);
        return {
            fieldCount: keys.length,
            description: `📦 This response has ${keys.length} pieces of information, like a treasure box with ${keys.length} different treasures!`,
            mainFields: keys.slice(0, 5) // Show first 5 fields
        };
    }

    /**
     * 🧠 Explain what the response means
     */
    explainResponse(response) {
        const explanations = [];

        if (response.status === 200) {
            explanations.push("🎯 Perfect! The API understood exactly what you wanted, like when you ask for your favorite snack and get it!");
        }

        if (response.data && Array.isArray(response.data)) {
            explanations.push(`📚 You got a list with ${response.data.length} items! It's like getting a box of different colored crayons!`);
        }

        if (response.headers && response.headers['content-type']) {
            const contentType = response.headers['content-type'];
            if (contentType.includes('json')) {
                explanations.push("📋 The data came back in JSON format - that's like getting information in a neat, organized list!");
            }
        }

        return explanations;
    }

    /**
     * 📋 Format headers in a kid-friendly way
     */
    formatHeaders(headers) {
        const formatted = {};
        const friendlyNames = {
            'content-type': '📄 What kind of data this is',
            'content-length': '📏 How big the data is',
            'server': '🖥️ What computer sent this',
            'date': '📅 When this was sent',
            'cache-control': '💾 How long to remember this'
        };

        for (let [key, value] of Object.entries(headers || {})) {
            formatted[key] = {
                value,
                friendlyName: friendlyNames[key.toLowerCase()] || `🔧 ${key}`,
                explanation: this.explainHeader(key, value)
            };
        }

        return formatted;
    }

    /**
     * 💡 Explain what headers mean
     */
    explainHeader(key, value) {
        const explanations = {
            'content-type': 'This tells us what kind of information we got back - like knowing if a box contains toys or books!',
            'content-length': 'This tells us how much information we got - like knowing how many pages are in a book!',
            'server': 'This tells us what kind of computer sent us the information - like knowing which friend sent you a letter!',
            'date': 'This tells us exactly when the information was sent - like a timestamp on a photo!',
            'cache-control': 'This tells us how long we can remember this information - like how long milk stays fresh!'
        };

        return explanations[key.toLowerCase()] || 'This is technical information that helps computers talk to each other!';
    }
}

/**
 * 📚 Request History Manager - Keeps track of all the cool stuff you've tried!
 */
class HistoryManager {
    constructor() {
        this.history = [];
        this.collections = new Map();
        this.maxHistorySize = 1000;
    }

    /**
     * 💾 Save a request to history
     */
    saveRequest(request, response, userId, metadata = {}) {
        const historyEntry = {
            id: this.generateId(),
            userId,
            timestamp: Date.now(),
            request: {
                method: request.method,
                url: request.url,
                headers: request.headers,
                body: request.body,
                auth: request.auth
            },
            response: {
                status: response.status,
                data: response.data,
                headers: response.headers,
                timing: response.timing
            },
            metadata: {
                ...metadata,
                friendlyName: this.generateFriendlyName(request),
                tags: this.generateTags(request, response)
            }
        };

        this.history.unshift(historyEntry);
        
        // Keep history size manageable
        if (this.history.length > this.maxHistorySize) {
            this.history = this.history.slice(0, this.maxHistorySize);
        }

        console.log(`📚 Saved ${userId}'s request to history! It's like adding a new page to your adventure journal!`);
        
        return historyEntry;
    }

    /**
     * 🔍 Get history for a user
     */
    getUserHistory(userId, limit = 50) {
        return this.history
            .filter(entry => entry.userId === userId)
            .slice(0, limit)
            .map(entry => ({
                ...entry,
                friendlyDescription: this.getFriendlyDescription(entry)
            }));
    }

    /**
     * 🌍 Get collaborative history (all users)
     */
    getCollaborativeHistory(limit = 100) {
        return this.history
            .slice(0, limit)
            .map(entry => ({
                ...entry,
                friendlyDescription: this.getFriendlyDescription(entry)
            }));
    }

    /**
     * 🔄 Replay a previous request
     */
    replayRequest(historyId, userId) {
        const entry = this.history.find(h => h.id === historyId);
        if (!entry) {
            return {
                success: false,
                message: "🔍 Oops! Couldn't find that request. It's like looking for a toy that got lost!"
            };
        }

        console.log(`🔄 ${userId} is replaying a request like rewatching their favorite movie!`);
        
        return {
            success: true,
            request: entry.request,
            message: `🎬 Ready to replay! This is like getting to do your favorite experiment again!`
        };
    }

    /**
     * 📦 Create a collection from history
     */
    createCollection(name, historyIds, userId, description = '') {
        const requests = historyIds
            .map(id => this.history.find(h => h.id === id))
            .filter(entry => entry !== undefined);

        if (requests.length === 0) {
            return {
                success: false,
                message: "📦 No valid requests found! It's like trying to pack an empty suitcase!"
            };
        }

        const collection = {
            id: this.generateId(),
            name,
            description,
            createdBy: userId,
            createdAt: Date.now(),
            requests: requests.map(entry => ({
                name: entry.metadata.friendlyName,
                request: entry.request,
                tags: entry.metadata.tags
            })),
            collaborators: [userId],
            isPublic: false
        };

        this.collections.set(collection.id, collection);
        
        console.log(`📦 ${userId} created a new collection called "${name}" with ${requests.length} requests! It's like making a playlist of your favorite songs!`);
        
        return {
            success: true,
            collection,
            message: `🎉 Collection "${name}" created successfully! You're like a curator of your own API museum!`
        };
    }

    /**
     * 📤 Export collection
     */
    exportCollection(collectionId, format = 'json') {
        const collection = this.collections.get(collectionId);
        if (!collection) {
            return {
                success: false,
                message: "📦 Collection not found! It's like looking for a book that's not on the shelf!"
            };
        }

        const exportData = {
            ...collection,
            exportedAt: Date.now(),
            format,
            kidFriendlyNote: "🎉 This collection was exported from the Kid-Friendly API Testing Platform! Share it with friends to explore APIs together!"
        };

        return {
            success: true,
            data: exportData,
            filename: `${collection.name.replace(/[^a-zA-Z0-9]/g, '_')}_collection.json`,
            message: `📤 Collection exported! It's like making a copy of your favorite recipe to share with friends!`
        };
    }

    /**
     * 📥 Import collection
     */
    importCollection(collectionData, userId) {
        try {
            const collection = {
                ...collectionData,
                id: this.generateId(),
                importedBy: userId,
                importedAt: Date.now(),
                originalId: collectionData.id
            };

            // Add user as collaborator if not already
            if (!collection.collaborators.includes(userId)) {
                collection.collaborators.push(userId);
            }

            this.collections.set(collection.id, collection);
            
            console.log(`📥 ${userId} imported a collection with ${collection.requests.length} requests! It's like getting a new box of toys to play with!`);
            
            return {
                success: true,
                collection,
                message: `🎉 Collection imported successfully! You now have ${collection.requests.length} new requests to explore!`
            };
        } catch (error) {
            return {
                success: false,
                message: "📥 Oops! The collection file was confusing. It's like trying to read a book in a different language!",
                error: error.message
            };
        }
    }

    /**
     * 🎨 Generate friendly name for requests
     */
    generateFriendlyName(request) {
        const url = new URL(request.url);
        const domain = url.hostname.replace('www.', '');
        const method = request.method.toUpperCase();
        
        const friendlyDomains = {
            'jsonplaceholder.typicode.com': 'Practice API',
            'api.github.com': 'GitHub',
            'httpbin.org': 'HTTP Testing',
            'reqres.in': 'Test API'
        };

        const domainName = friendlyDomains[domain] || domain;
        
        return `${method} request to ${domainName}`;
    }

    /**
     * 🏷️ Generate tags for requests
     */
    generateTags(request, response) {
        const tags = [];
        
        // Method tags
        tags.push(request.method.toLowerCase());
        
        // Status tags
        if (response.status >= 200 && response.status < 300) {
            tags.push('success');
        } else if (response.status >= 400) {
            tags.push('error');
        }
        
        // Content type tags
        if (response.headers && response.headers['content-type']) {
            if (response.headers['content-type'].includes('json')) {
                tags.push('json');
            }
        }
        
        // URL-based tags
        const url = request.url.toLowerCase();
        if (url.includes('user')) tags.push('users');
        if (url.includes('post')) tags.push('posts');
        if (url.includes('comment')) tags.push('comments');
        
        return tags;
    }

    /**
     * 📝 Get friendly description of history entry
     */
    getFriendlyDescription(entry) {
        const time = new Date(entry.timestamp).toLocaleString();
        const status = entry.response.status;
        const method = entry.request.method.toUpperCase();
        
        const statusEmoji = status >= 200 && status < 300 ? '✅' : '❌';
        
        return `${statusEmoji} ${entry.userId} made a ${method} request at ${time} and got a ${status} response`;
    }

    /**
     * 🎲 Generate unique ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * 🧹 Clean up old history
     */
    cleanup() {
        const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
        const now = Date.now();
        
        this.history = this.history.filter(entry => 
            now - entry.timestamp < maxAge
        );
        
        console.log(`🧹 Cleaned up old history! Keeping things fresh like organizing your room!`);
    }
}

module.exports = {
    ConflictResolver,
    ResponseFormatter,
    HistoryManager
};
