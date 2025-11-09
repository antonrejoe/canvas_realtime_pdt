# Collaborative Drawing Application - Complete Project Architecture

## Executive Summary

The **Collaborative Drawing Application** is a real-time multiplayer drawing platform built with **Node.js**, **Socket.io**, and **HTML5 Canvas**. It enables multiple users to create isolated rooms and draw together with real-time synchronization, cursor tracking, and collaborative features like undo/redo and multi-brush support.

## Project Architecture diagram
<img width="971" height="641" alt="architecture" src="https://github.com/user-attachments/assets/2b01470e-dc22-482b-85ea-43c3739ca8a7" />


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


## WebSocket Protocol

**Message Design:**
All major collaborative operations are communicated through defined WebSocket (Socket.io) events:

- **Drawing Events:**
    - `drawing_event` (client → server): Contains encoded stroke data (user, color, brush, coordinates, etc.).
    - `drawing_from_other_user` (server → client): Broadcasts new strokes to room participants.
- **Cursor Tracking:**
    - `client_mouse_coordinates` (client → server): Sends (x, y) cursor data.
    - `other_user_coordinates` (server → client): Forwards user position, color, and ID to room.
- **Room Management:**
    - `create-room`, `join-room`, `leave-room` (client ↔ server): Handles room lifecycle and membership.
    - `room-list`, `user-joined`, `user-left` (server → client): Synchronizes available rooms and user presence.
- **State Synchronization:**
    - `canvas-state`, `redraw_canvas`: Ensures all users have the current room’s strokes and drawing state.
- **Undo/Redo (Control Events):**
    - `undo`, `redo` (client → server): Requests operation.
    - `redraw_canvas` (server → client): Updates all clients with the resulting canvas state after the operation.

**Each event clearly defines sender, payload, and intended receiver effect.**

 

## Undo/Redo Strategy

**Approach:**

- Every room maintains per-user undo and redo stacks held in the server’s memory.
- When a user draws, their stroke is pushed onto their undo stack.
- **Undo Event:**
    - When “undo” is triggered, the backend removes a configurable number of the user's most recent strokes from the canvas state and moves those to their redo stack.
    - The server then emits a `redraw_canvas` event to this room with the updated stroke state, so all users see the revision.
- **Redo Event:**
    - “Redo” pulls strokes back from the redo stack to the active canvas and again triggers `redraw_canvas`.
- All actions are indexed and handled per user for granularity.
- **Edge Cases:**
    - If a user leaves, their undo/redo stacks are cleaned up.
    - Undo operations affect only the strokes owned by the requesting user.

 

## Performance Decisions

**Key Optimizations:**

- Chose in-memory JavaScript Maps/Sets for ultra-fast access (sub-ms lookup).
- Batched broadcast communication per room only, avoiding unnecessary global emits.
- Minimally-encoded drawing data using MessagePack (significantly reducing payload sizes).
- All state synchronization happens with explicit events; no polling.
- Limited number of undo/redo operations retained per user to manage memory.
- Used ES6 modules and modern syntax for better browser/server performance.

 

## Conflict Resolution

**Concurrency Handling:**
All incoming events are processed and applied on the server in receive order (FIFO), which becomes the global ordering. No locks are required since the server is single-threaded per process; application of overlapping or simultaneous strokes is resolved visually by render order (last-wins as drawn on canvas).

**Simultaneous Drawing:**
If multiple users draw at the same instant, the server receives and rebroadcasts those events immediately; each client renders updates in the order received from the server, which reflects their occurrence in the global event stream.

**Edge Cases:**
If events from different users arrive at nearly the same time, they may be rendered on each client in slightly different orders, but the subsequent `redraw_canvas` state ensures everyone will sync up after any undo, redo, or clear operation.


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
