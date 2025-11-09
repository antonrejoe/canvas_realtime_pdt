import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js"
import { draw, ctx, w, h } from './canvas.js'

const socket = io('http://localhost:3000')

const userCursors = new Map();
let currentRoomId = null;

// Room management UI
let roomListContainer = null;

// Initialize room UI elements
function initRoomUI() {
    // Create room controls if they don't exist
    if (!document.getElementById('room-controls')) {
        const roomControls = document.createElement('div');
        roomControls.id = 'room-controls';
        roomControls.innerHTML = `
            <div class="room-section">
                <h3>Rooms</h3>
                <div class="room-info" id="current-room-info">Not in a room</div>
                <div class="room-buttons">
                    <button onclick="createRoom()" id="create-room-btn">Create Room</button>
                    <button onclick="showJoinRoomDialog()" id="join-room-btn">Join Room</button>
                    <button onclick="leaveRoom()" id="leave-room-btn" style="display:none;">Leave Room</button>
                </div>
                <div id="room-list" class="room-list"></div>
            </div>
        `;
        document.body.insertBefore(roomControls, document.body.firstChild);
    }
    roomListContainer = document.getElementById('room-list');
}

// Create a new room
window.createRoom = function() {
    socket.emit('create-room', { maxUsers: 10 });
}

// Show join room dialog
window.showJoinRoomDialog = function() {
    const roomId = prompt('Enter Room ID:');
    if (roomId && roomId.trim()) {
        joinRoom(roomId.trim().toUpperCase());
    }
}

// Join a room
window.joinRoom = function(roomId) {
    socket.emit('join-room', { roomId });
}

// Leave current room
window.leaveRoom = function() {
    if (currentRoomId) {
        socket.emit('leave-room');
        currentRoomId = null;
        updateRoomUI();
        // Clear canvas when leaving
        ctx.clearRect(0, 0, w, h);
    }
}

// Update room UI
function updateRoomUI() {
    const roomInfo = document.getElementById('current-room-info');
    const createBtn = document.getElementById('create-room-btn');
    const joinBtn = document.getElementById('join-room-btn');
    const leaveBtn = document.getElementById('leave-room-btn');

    if (currentRoomId) {
        roomInfo.textContent = `Room: ${currentRoomId}`;
        roomInfo.style.color = '#4CAF50';
        createBtn.style.display = 'none';
        joinBtn.style.display = 'none';
        leaveBtn.style.display = 'inline-block';
    } else {
        roomInfo.textContent = 'Not in a room';
        roomInfo.style.color = '#f44336';
        createBtn.style.display = 'inline-block';
        joinBtn.style.display = 'inline-block';
        leaveBtn.style.display = 'none';
    }
}

// Update local follower cursor
function updateLocalCursor(x, y) {
    const follower = document.getElementById('follower');
    if (follower) {
        follower.style.left = (x - 10) + 'px';
        follower.style.top = (y - 10) + 'px';
    }
}

// Room events
socket.on('room-created', (data) => {
    alert(`Room created! Room ID: ${data.roomId}`);
    joinRoom(data.roomId);
});

socket.on('room-error', (data) => {
    alert(`Error: ${data.error}`);
});

socket.on('room-list', (rooms) => {
    if (!roomListContainer) return;
    
    roomListContainer.innerHTML = '<h4>Available Rooms:</h4>';
    if (rooms.length === 0) {
        roomListContainer.innerHTML += '<p>No rooms available</p>';
    } else {
        rooms.forEach(room => {
            const roomDiv = document.createElement('div');
            roomDiv.className = 'room-item';
            roomDiv.innerHTML = `
                <span>${room.roomId} (${room.userCount}/${room.maxUsers})</span>
                ${!room.isFull && !currentRoomId ? 
                    `<button onclick="joinRoom('${room.roomId}')">Join</button>` : 
                    '<span>Full</span>'}
            `;
            roomListContainer.appendChild(roomDiv);
        });
    }
});

// Connection event
socket.on('connected', (data) => {
    const userId = data.userId;
    const userColor = data.color;
    currentRoomId = data.roomId;
    
    const follower = document.getElementById('follower');
    if (follower) {
        follower.style.backgroundColor = userColor;
    }
    
    updateRoomUI();
    console.log(`Connected to room ${currentRoomId} with color ${userColor}`);
});

// Mobile support - touch events
let isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

// Track touch state
let touchActive = false;

// Send mouse/touch coordinates with local cursor update
function sendCoordinates(x, y) {
    // Update local cursor
    updateLocalCursor(x, y);
    
    // Send to server
    socket.emit('client_mouse_coordinates', { x, y });
}

// Desktop mouse events
document.addEventListener('mousemove', e => {
    if (!isMobile) {
        sendCoordinates(e.clientX, e.clientY);
    }
});

// Mobile touch events for cursor tracking
document.addEventListener('touchmove', e => {
    if (isMobile && e.touches.length > 0) {
        const touch = e.touches[0];
        sendCoordinates(touch.clientX, touch.clientY);
    }
}, { passive: true });

// Receiving other user mouse/touch coordinates
socket.on('other_user_coordinates', data => {
    const color = data.color;
    const id = data.id;
    const x = data.coord.x;
    const y = data.coord.y;

    let newDiv = userCursors.get(id);
    if (!newDiv) {
        newDiv = document.createElement('div');
        newDiv.id = id;
        newDiv.classList.add('cursor_anchor_styling');
        newDiv.style.backgroundColor = color;
        document.body.appendChild(newDiv);
        userCursors.set(id, newDiv);
    }

    newDiv.style.left = (x - 10) + 'px';
    newDiv.style.top = (y - 10) + 'px';
});

// User left event
socket.on('user-left', data => {
    const cursorDiv = userCursors.get(data.userId);
    if (cursorDiv) {
        userCursors.delete(data.userId);
        cursorDiv.remove();
    }
});

// Drawing events
socket.on('drawing_from_other_user', data => {
    const size = data.item.size;
    const cX = data.item.cX;
    const cY = data.item.cY;
    const pX = data.item.pX;
    const pY = data.item.pY;
    const color = data.item.color;
    const brush = data.item.brush;
    draw(size, pX, pY, cX, cY, color, brush);
});

// Canvas state
socket.on('canvas-state', allStrokes => {
    allStrokes.forEach(stroke => {
        draw(stroke.size, stroke.pX, stroke.pY, stroke.cX, stroke.cY, stroke.color, stroke.brush);
    });
});

// Redraw canvas
socket.on('redraw_canvas', allStrokes => {
    ctx.clearRect(0, 0, w, h);
    allStrokes.forEach(stroke => {
        draw(stroke.size, stroke.pX, stroke.pY, stroke.cX, stroke.cY, stroke.color, stroke.brush);
    });
});

// User joined
socket.on('user-joined', (data) => {
    console.log(`User joined room. Total users: ${data.userCount}`);
});

// Undo/Redo functions
function undo(e) {
    if (currentRoomId) {
        socket.emit('undo');
    }
}

function redo(e) {
    if (currentRoomId) {
        socket.emit('redo');
    }
}

// Initialize room UI on load
setTimeout(initRoomUI, 100);

export default socket;
window.undo = undo;
window.redo = redo;



