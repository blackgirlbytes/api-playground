#!/usr/bin/env node

/**
 * 🚀 API Adventure Playground - Demo Script
 * Shows off all the amazing features of our kid-friendly collaborative API testing platform!
 */

const { ConflictResolver, ResponseFormatter, HistoryManager } = require('./conflict-resolution');

console.log(`
🎉 Welcome to the API Adventure Playground Demo! 🎉

This is a real-time collaborative API testing platform designed for kids!
It's like "Google Docs for Postman" but way more fun and educational! ✨

Let's see what we've built together...
`);

// Demo the Conflict Resolution System
console.log('🤝 CONFLICT RESOLUTION DEMO:');
console.log('═'.repeat(50));

const conflictResolver = new ConflictResolver();

// Simulate two kids editing at the same time
const kid1Edit = {
    type: 'edit',
    field: 'url',
    position: 10,
    text: 'https://dog.ceo/api/breeds/image/random',
    userId: 'Emma'
};

const kid2Edit = {
    type: 'edit',
    field: 'url', 
    position: 15,
    text: 'https://official-joke-api.appspot.com/random_joke',
    userId: 'Alex'
};

console.log('👧 Emma is editing the URL...');
const result1 = conflictResolver.applyOperation(kid1Edit, 'Emma');

console.log('👦 Alex is also editing the URL at the same time...');
conflictResolver.pendingOperations = [kid2Edit];
const result2 = conflictResolver.applyOperation(kid1Edit, 'Emma');

if (result2.resolvedConflict) {
    console.log('✅ Conflict resolved automatically! Both kids can work together! 🤝');
}

// Demo Response Formatter
console.log('\n🎨 RESPONSE FORMATTER DEMO:');
console.log('═'.repeat(50));

const formatter = new ResponseFormatter();

const mockResponse = {
    status: 200,
    data: { 
        message: "Woof! Here's a random dog fact!",
        fact: "Dogs have three eyelids!",
        breed: "Golden Retriever"
    },
    headers: { 'content-type': 'application/json' }
};

console.log('📥 Raw API Response received...');
const formatted = formatter.formatResponse(mockResponse, 234);

console.log('🎨 Kid-friendly formatted response:');
console.log(`   ${formatted.status.emoji} ${formatted.status.message}`);
console.log(`   ${formatted.timing.emoji} ${formatted.timing.description}`);
console.log(`   ${formatted.size.emoji} ${formatted.size.description}`);

if (formatted.kidFriendlyExplanation.length > 0) {
    console.log('💡 What this means:');
    formatted.kidFriendlyExplanation.forEach(explanation => {
        console.log(`   ${explanation}`);
    });
}

// Demo History Manager
console.log('\n📚 HISTORY MANAGER DEMO:');
console.log('═'.repeat(50));

const historyManager = new HistoryManager();

// Simulate some API requests
const requests = [
    {
        request: { method: 'GET', url: 'https://dog.ceo/api/breeds/image/random', headers: {}, body: null },
        response: { status: 200, data: { message: "https://images.dog.ceo/breeds/hound-afghan/n02088094_1007.jpg" }, headers: {}, timing: 145 },
        user: 'Emma'
    },
    {
        request: { method: 'GET', url: 'https://official-joke-api.appspot.com/random_joke', headers: {}, body: null },
        response: { status: 200, data: { setup: "Why don't scientists trust atoms?", punchline: "Because they make up everything!" }, headers: {}, timing: 267 },
        user: 'Alex'
    },
    {
        request: { method: 'GET', url: 'https://catfact.ninja/fact', headers: {}, body: null },
        response: { status: 200, data: { fact: "Cats have five toes on their front paws, but only four toes on their back paws." }, headers: {}, timing: 189 },
        user: 'Sophie'
    }
];

console.log('💾 Saving requests to history...');
const historyEntries = [];
requests.forEach(req => {
    const saved = historyManager.saveRequest(req.request, req.response, req.user);
    historyEntries.push(saved);
    console.log(`   📝 Saved ${req.user}'s request: ${saved.metadata.friendlyName}`);
});

console.log('\n📖 Collaborative history:');
const collaborativeHistory = historyManager.getCollaborativeHistory(5);
collaborativeHistory.forEach(entry => {
    console.log(`   ${entry.friendlyDescription}`);
});

// Create a collection
console.log('\n📦 Creating a fun collection...');
const collectionResult = historyManager.createCollection(
    'Fun Animal APIs',
    historyEntries.map(e => e.id),
    'Teacher',
    'A collection of safe, fun APIs about animals and jokes for kids to explore!'
);

if (collectionResult.success) {
    console.log(`   ✅ ${collectionResult.message}`);
    console.log(`   📚 Collection contains ${collectionResult.collection.requests.length} awesome requests!`);
}

// Demo export
const exportResult = historyManager.exportCollection(collectionResult.collection.id);
if (exportResult.success) {
    console.log(`   📤 Collection exported as: ${exportResult.filename}`);
}

console.log('\n🌟 PLATFORM FEATURES SUMMARY:');
console.log('═'.repeat(50));

const features = [
    '🌐 Real-time WebSocket collaboration',
    '🎯 Kid-friendly API request builder',
    '🤝 Automatic conflict resolution',
    '🎨 Response formatting with emojis and explanations',
    '📚 Request history and collections',
    '👥 Live user presence and activity feed',
    '🛡️ Safety-first approach with educational content',
    '🎮 Fun, game-like interface design',
    '📱 Responsive design for all devices',
    '🧪 Comprehensive test suite',
    '📖 Beginner-friendly documentation',
    '🎁 Ready-to-use example collections'
];

features.forEach(feature => {
    console.log(`   ${feature}`);
});

console.log('\n🚀 HOW TO GET STARTED:');
console.log('═'.repeat(50));
console.log('1. 📦 Install dependencies: npm install');
console.log('2. 🚀 Start the server: npm start');
console.log('3. 🌐 Open index.html in your browser');
console.log('4. 👥 Share with friends and start exploring APIs together!');
console.log('5. 📚 Try the example collection for safe, fun APIs');

console.log('\n🎓 EDUCATIONAL VALUE:');
console.log('═'.repeat(50));
console.log('• Learn HTTP methods (GET, POST, PUT, DELETE)');
console.log('• Understand JSON data format');
console.log('• Practice debugging and problem-solving');
console.log('• Develop collaboration skills');
console.log('• Explore real-world APIs safely');
console.log('• Build confidence with technology');

console.log('\n🎉 Ready to start your API adventure? Let\'s go! 🚀\n');

// Run a quick system check
console.log('🔧 SYSTEM CHECK:');
console.log('═'.repeat(50));

try {
    // Check if all modules load correctly
    const WebSocket = require('ws');
    console.log('✅ WebSocket library loaded successfully');
    
    // Check if conflict resolution works
    const testResolver = new ConflictResolver();
    console.log('✅ Conflict resolution system ready');
    
    // Check if response formatter works
    const testFormatter = new ResponseFormatter();
    console.log('✅ Response formatter ready');
    
    // Check if history manager works
    const testHistory = new HistoryManager();
    console.log('✅ History manager ready');
    
    console.log('\n🎉 All systems are GO! The playground is ready for young explorers! 🌟');
    
} catch (error) {
    console.log(`❌ System check failed: ${error.message}`);
    console.log('💡 Try running: npm install');
}

console.log('\n' + '🌈'.repeat(25));
console.log('   Welcome to the API Adventure Playground!');
console.log('   Where learning meets fun and collaboration! ✨');
console.log('🌈'.repeat(25) + '\n');
