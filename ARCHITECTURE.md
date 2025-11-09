# Collaborative Drawing Application - Complete Project Architecture

## Executive Summary

The **Collaborative Drawing Application** is a real-time multiplayer drawing platform built with **Node.js**, **Socket.io**, and **HTML5 Canvas**. It enables multiple users to create isolated rooms and draw together with real-time synchronization, cursor tracking, and collaborative features like undo/redo and multi-brush support.


## 📁 Project Structure Overview

```
collaborative-drawing-app/
│
├─── SERVER SIDE (Node.js)
│    ├─ server.js              (Main WebSocket server - 3.5KB)
│    ├─ rooms.js               (Room management - 8KB)
│    └── drawing-state.js       (Undo/redo logic - 1.8KB)    
│
├─── CLIENT SIDE (Frontend)
│    ├─ index.html             (HTML structure - 2KB)
│    ├─ websocket.js           (WebSocket client - 2.5KB)
│    ├─ canvas.js              (Drawing engine - 4.8KB)
│    ├─ style.css              (Responsive design - 860B)
│    └─ .resources/
│        └─ utils/
│            └─ brush.js       (6 brush implementations)
│ 
├──── package.json           (Dependencies - Server)
```


---

## 🔄 Core Data Flows

### Flow 1: User Connection
```
User Opens App → Load HTML/JS → Connect WebSocket → 
Send 'join-room' → Server validates → Assign color → 
Send state + 'connected' → Ready to draw
```

### Flow 2: Drawing Stroke
```
Mouse drag → Calculate coords → Draw locally → 
Encode stroke → Send 'drawing_event' → 
Server adds to room → Broadcast to others → 
Others decode & render → All see stroke
```

### Flow 3: Cursor Tracking
```
Mouse move → Send coordinates → Update local cursor → 
updateLocalCursor(x, y) → Server broadcasts → 
Others receive → Update other user cursors
```

### Flow 4: Undo Operation
```
Click Undo → Emit 'undo' → Server pops undo stack → 
Push to redo stack → Remove strokes → 
Broadcast 'redraw_canvas' → All users clear & redraw
```

### Flow 5: Room Management
```
Create/Join → Emit event → Server validates → 
Add to room → Send room state → Broadcast join → 
Update room list → Others see new user
```


---

## 📈 Scalability Roadmap

### Stage 1: Current (Single Server)
```
Capacity: ~5,000 concurrent users
Storage: In-memory (no persistence)
Performance: Excellent (<50ms latency)
Cost: Low
Limitation: Single point of failure
```

### Stage 2: Database Persistence (Month 1-2)
```
Add: MongoDB/PostgreSQL
Store: Room history, user sessions
Capacity: Still ~5,000 concurrent
Performance: May add 10-20ms latency
Benefit: Data persistence
```

### Stage 3: Horizontal Scaling (Month 3-6)
```
Add: Load balancer, Redis pub/sub
Multiple: Node.js servers
Capacity: ~50,000 concurrent users
Performance: <100ms latency (acceptable)
Benefit: Handle growth, redundancy
```

### Stage 4: Global CDN (Month 6-12)
```
Add: CloudFlare/Akamai
Add: Regional servers
Capacity: Unlimited
Performance: 50-200ms (geography dependent)
Benefit: Global reach, DDoS protection
```

---