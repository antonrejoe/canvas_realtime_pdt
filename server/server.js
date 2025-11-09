const { encode, decode } = require("@msgpack/msgpack");
const io = require('socket.io')(3000, {
    perMessageDeflate: true,
    cors: {
        origin: ["http://127.0.0.1:5500", "http://localhost:5500", "https://canvas-realtime-pdt.vercel.app"],
    },
});

// Import room management functions
const {
    createRoom,
    getRoom,
    roomExists,
    addUserToRoom,
    removeUserFromRoom,
    getRoomUsers,
    getAllRooms,
    clearRoomDrawing,
    addStrokeToRoom,
    getRoomStrokes,
    getUniqueColorForRoom,
    cleanupOldRooms
} = require('./rooms');

// Import drawing state functions
const { drawing_state_update, undo, redo } = require('./drawing-state');

// Utility function to get random color (kept for compatibility)
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Track which room each socket is in
const socketRooms = new Map();

// Clean up old rooms every hour
setInterval(() => {
    cleanupOldRooms(24);
}, 60 * 60 * 1000);

io.on("connection", socket => {
    console.log(`Socket connected: ${socket.id}`);

    // Send list of available rooms
    socket.emit('room-list', getAllRooms());

    // Handle room creation
    socket.on('create-room', (data) => {
        const maxUsers = data?.maxUsers || 10;
        const roomId = createRoom(maxUsers);
        socket.emit('room-created', { roomId });
    });

    // Handle joining a room
    socket.on('join-room', (data) => {
        const roomId = data.roomId;

        if (!roomExists(roomId)) {
            socket.emit('room-error', { error: 'Room does not exist' });
            return;
        }

        const room = getRoom(roomId);
        const userColor = getUniqueColorForRoom(roomId);
        const result = addUserToRoom(roomId, socket.id, userColor);

        if (!result.success) {
            socket.emit('room-error', { error: result.error });
            return;
        }

        // Join the socket.io room
        socket.join(roomId);
        socketRooms.set(socket.id, roomId);

        // Send current canvas state to the new user
        socket.emit('canvas-state', getRoomStrokes(roomId));

        // Send connection confirmation with user color
        socket.emit('connected', {
            userId: socket.id,
            color: userColor,
            roomId: roomId,
            userCount: room.users.size
        });

        // Notify others in the room
        socket.to(roomId).emit('user-joined', {
            userId: socket.id,
            userCount: room.users.size
        });

        // Update room list for all clients
        io.emit('room-list', getAllRooms());
    });

    // Handle mouse coordinates (room-specific)
    socket.on('client_mouse_coordinates', data => {
        const roomId = socketRooms.get(socket.id);
        if (!roomId) return;

        const room = getRoom(roomId);
        if (!room) return;

        const userColor = room.userColors.get(socket.id);
        socket.to(roomId).emit('other_user_coordinates', {
            color: userColor,
            id: socket.id,
            coord: data
        });
    });

    // Handle drawing events (room-specific)
    socket.on('drawing_event', data => {
        const roomId = socketRooms.get(socket.id);
        if (!roomId) return;

        const room = getRoom(roomId);
        if (!room) return;

        const strokeData = decode(data);
        addStrokeToRoom(roomId, strokeData);

        // Update drawing state for undo/redo
        drawing_state_update(strokeData, room.userUndoStack, room.userRedoStack, socket);

        // Broadcast to others in the room
        socket.to(roomId).emit('drawing_from_other_user', {
            item: strokeData
        });
    });

    // Handle clear canvas (room-specific)
    socket.on('clear_user_drawing', () => {
        const roomId = socketRooms.get(socket.id);
        if (!roomId) return;

        const room = getRoom(roomId);
        if (!room) return;

        console.log(`${socket.id} cleared canvas in room ${roomId}`);
        clearRoomDrawing(roomId, socket.id);

        // Broadcast canvas redraw to all in room
        io.to(roomId).emit('redraw_canvas', getRoomStrokes(roomId));
    });

    // Handle undo (room-specific)
    socket.on('undo', () => {
        const roomId = socketRooms.get(socket.id);
        if (!roomId) return;

        const room = getRoom(roomId);
        if (!room) return;

        undo(room.userUndoStack, room.userRedoStack, room.drawStrokes, socket);
        io.to(roomId).emit('redraw_canvas', getRoomStrokes(roomId));
    });

    // Handle redo (room-specific)
    socket.on('redo', () => {
        const roomId = socketRooms.get(socket.id);
        if (!roomId) return;

        const room = getRoom(roomId);
        if (!room) return;

        redo(room.userUndoStack, room.userRedoStack, room.drawStrokes, socket);
        io.to(roomId).emit('redraw_canvas', getRoomStrokes(roomId));
    });

    // Handle leaving a room
    socket.on('leave-room', () => {
        const roomId = socketRooms.get(socket.id);
        if (!roomId) return;

        socket.leave(roomId);
        removeUserFromRoom(roomId, socket.id);
        socketRooms.delete(socket.id);

        const room = getRoom(roomId);
        const remainingUsers = room ? room.users.size : 0;

        // Notify others in the room
        socket.to(roomId).emit('user-left', {
            userId: socket.id,
            userCount: remainingUsers
        });

        // Redraw canvas for remaining users
        if (room) {
            io.to(roomId).emit('redraw_canvas', getRoomStrokes(roomId));
        }

        // Update room list for all clients
        io.emit('room-list', getAllRooms());
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
        const roomId = socketRooms.get(socket.id);
        
        if (roomId) {
            removeUserFromRoom(roomId, socket.id);
            socketRooms.delete(socket.id);

            const room = getRoom(roomId);
            const remainingUsers = room ? room.users.size : 0;

            // Notify others in the room
            socket.to(roomId).emit('user-left', {
                userId: socket.id,
                userCount: remainingUsers
            });

            // Redraw canvas for remaining users
            if (room) {
                io.to(roomId).emit('redraw_canvas', getRoomStrokes(roomId));
            }

            // Update room list for all clients
            io.emit('room-list', getAllRooms());
        }
    });

    // Request room list
    socket.on('request-room-list', () => {
        socket.emit('room-list', getAllRooms());
    });
});

console.log('Server running on port 3000');
