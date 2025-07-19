# Railway Deployment Setup

## Changes Needed:

1. **Add static file serving to server.js:**

```javascript
const path = require('path');
const fs = require('fs');

// Add this after creating the HTTP server
server.on('request', (req, res) => {
    if (req.url === '/' || req.url === '/index.html') {
        fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end('Not found');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
    } else if (req.url.endsWith('.css')) {
        const cssFile = path.join(__dirname, req.url.substring(1));
        fs.readFile(cssFile, (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end('Not found');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/css' });
            res.end(data);
        });
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
});
```

2. **Update WebSocket URL in index.html:**
Replace `ws://localhost:3001` with:
```javascript
const wsUrl = window.location.protocol === 'https:' 
    ? `wss://${window.location.host}` 
    : `ws://${window.location.host}`;
ws = new WebSocket(wsUrl);
```

3. **Deploy to Railway:**
- Connect your GitHub repo
- Railway will auto-detect Node.js
- Your app will get a public URL
- WebSockets will work perfectly

## Railway Deployment Steps:
1. Push code to GitHub
2. Connect Railway to your repo
3. Deploy automatically
4. Get public URL like: `https://your-app.railway.app`
