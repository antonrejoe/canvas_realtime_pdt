// rooms.js - Room management functions for collaborative drawing application

// Room storage - each room has its own drawing state
const rooms = new Map();

/**
 * Room structure:
 * {
 *   roomId: string,
 *   drawStrokes: Array,
 *   userUndoStack: Map,
 *   userRedoStack: Map,
 *   users: Set,
 *   userColors: Map,
 *   assignedColors: Set,
 *   createdAt: Date,
 *   maxUsers: number
 * }
 */

// Utility function to generate random room ID
function generateRoomId(length = 6) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let roomId = '';
    for (let i = 0; i < length; i++) {
        roomId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return roomId;
}

// Create a new room
function createRoom(maxUsers = 10) {
    let roomId;
    do {
        roomId = generateRoomId();
    } while (rooms.has(roomId));

    const roomData = {
        roomId: roomId,
        drawStrokes: [],
        userUndoStack: new Map(),
        userRedoStack: new Map(),
        users: new Set(),
        userColors: new Map(),
        assignedColors: new Set(),
        createdAt: new Date(),
        maxUsers: maxUsers
    };

    rooms.set(roomId, roomData);
    console.log(`Room created: ${roomId}`);
    return roomId;
}

// Get room data
function getRoom(roomId) {
    return rooms.get(roomId);
}

// Check if room exists
function roomExists(roomId) {
    return rooms.has(roomId);
}

// Add user to room
function addUserToRoom(roomId, socketId, userColor) {
    const room = rooms.get(roomId);
    if (!room) {
        return { success: false, error: 'Room not found' };
    }

    if (room.users.size >= room.maxUsers) {
        return { success: false, error: 'Room is full' };
    }

    room.users.add(socketId);
    room.userColors.set(socketId, userColor);
    room.assignedColors.add(userColor);

    console.log(`User ${socketId} joined room ${roomId}. Total users: ${room.users.size}`);
    return { success: true, room: room };
}

// Remove user from room
function removeUserFromRoom(roomId, socketId) {
    const room = rooms.get(roomId);
    if (!room) return;

    const userColor = room.userColors.get(socketId);
    
    room.users.delete(socketId);
    room.userColors.delete(socketId);
    room.assignedColors.delete(userColor);
    room.userUndoStack.delete(socketId);
    room.userRedoStack.delete(socketId);

    // Clean up user's strokes
    room.drawStrokes = room.drawStrokes.filter(stroke => stroke.userId !== socketId);

    console.log(`User ${socketId} left room ${roomId}. Remaining users: ${room.users.size}`);

    // Delete room if empty
    if (room.users.size === 0) {
        rooms.delete(roomId);
        console.log(`Room ${roomId} deleted (empty)`);
    }
}

// Get all users in a room
function getRoomUsers(roomId) {
    const room = rooms.get(roomId);
    return room ? Array.from(room.users) : [];
}

// Get room count
function getRoomCount() {
    return rooms.size;
}

// Get list of all rooms with metadata
function getAllRooms() {
    const roomList = [];
    rooms.forEach((room, roomId) => {
        roomList.push({
            roomId: roomId,
            userCount: room.users.size,
            maxUsers: room.maxUsers,
            createdAt: room.createdAt,
            isFull: room.users.size >= room.maxUsers
        });
    });
    return roomList;
}

// Clear room drawing
function clearRoomDrawing(roomId, socketId) {
    const room = rooms.get(roomId);
    if (!room) return false;

    room.drawStrokes = room.drawStrokes.filter(stroke => stroke.userId !== socketId);
    room.userUndoStack.set(socketId, []);
    room.userRedoStack.set(socketId, []);

    return true;
}

// Add stroke to room
function addStrokeToRoom(roomId, strokeData) {
    const room = rooms.get(roomId);
    if (!room) return false;

    room.drawStrokes.push(strokeData);
    return true;
}

// Get room drawing strokes
function getRoomStrokes(roomId) {
    const room = rooms.get(roomId);
    return room ? room.drawStrokes : [];
}

// Generate unique color for user in room
function getUniqueColorForRoom(roomId) {
    const room = rooms.get(roomId);
    if (!room) return '#000000';

    const letters = '0123456789ABCDEF';
    let color;
    let attempts = 0;
    const maxAttempts = 100;

    do {
        color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        attempts++;
    } while (room.assignedColors.has(color) && attempts < maxAttempts);

    if (attempts >= maxAttempts) {
        color = '#' + Math.floor(Math.random() * 16777215).toString(16);
    }

    return color;
}

// Clean up old empty rooms (can be called periodically)
function cleanupOldRooms(maxAgeHours = 24) {
    const now = new Date();
    rooms.forEach((room, roomId) => {
        const ageHours = (now - room.createdAt) / (1000 * 60 * 60);
        if (room.users.size === 0 && ageHours > maxAgeHours) {
            rooms.delete(roomId);
            console.log(`Cleaned up old room: ${roomId}`);
        }
    });
}

module.exports = {
    createRoom,
    getRoom,
    roomExists,
    addUserToRoom,
    removeUserFromRoom,
    getRoomUsers,
    getRoomCount,
    getAllRooms,
    clearRoomDrawing,
    addStrokeToRoom,
    getRoomStrokes,
    getUniqueColorForRoom,
    cleanupOldRooms
};
