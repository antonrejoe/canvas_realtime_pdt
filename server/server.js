
const io = require('socket.io')(3000,{
    cors:{
        origin: ["http://127.0.0.1:5500"],
    },
});

// state assignment logic

const userUndoStack = new Map()
const userRedoStack = new Map()
const {drawing_state_update, undo, redo} = require('./drawing-state')

// Assigning color to user

const assignedColors = new Set()
const userColors     = new Map()
let   drawStrokes    = []

// utility functions

function getRandomColor(){
    const letters = '0123456789ABCDEF';
    let color = '#';

    for(let i=0; i<6; i++){
        color += letters[Math.floor(Math.random()*16)];
    }

    return color
}

function uniqueColor(){
    let color;
    let attempts = 0;

    const maxAttempts = 100;

    do {
        color = getRandomColor();
        attempts++;
    }while(assignedColors.has(color) && attempts < maxAttempts );


    if(attempts >= maxAttempts){
        color = getRandomColor();
    }

    assignedColors.add(color);

    return color
}

io.on("connection", socket =>{
    console.log(socket.id)

    const userColor = uniqueColor()
    userColors.set(socket.id, userColor)


    socket.emit('canvas-state', drawStrokes)

    socket.emit('connected', {
        userId: socket.id,
        color : userColor
    } )

    socket.broadcast.emit('user-joined', {
        userId: socket.id
    })


    socket.on('client_mouse_coordinates', data => {

        socket.broadcast.emit('other_user_coordinates', {
            color: userColor,
            id   : socket.id,
            coord: data
        })
    })

    socket.on('disconnect', () => {
        const color = userColors.get(socket.id)
        assignedColors.delete(color)
        userColors.delete(socket.id)

        // clean up stacks here to free memory
        userUndoStack.delete(socket.id);
        userRedoStack.delete(socket.id);

        socket.broadcast.emit('user-left', {
            userId: socket.id
        })
    })


    socket.on('drawing_event', data => {
        drawStrokes.push(data)
        // 
        drawing_state_update(data, userUndoStack, userRedoStack, socket);

        socket.broadcast.emit('drawing_from_other_user', {
            item : data
        })
    } )

    socket.on('clear_user_drawing', () => {
        console.log(socket.id, 'user cleared his canvas') // so only that will be removed globally

        drawStrokes = drawStrokes.filter(stroke => {
            return stroke.userId !== socket.id
        })

        // Reset user's undo and redo stacks
        userUndoStack.set(socket.id, []);
        userRedoStack.set(socket.id, []);


        io.emit('redraw_canvas', drawStrokes) // io -> means emits to all client including the clearing user
    })


    // state management

    socket.on('undo', () => {
        undo(userUndoStack, userRedoStack, drawStrokes, socket)
        io.emit('redraw_canvas', drawStrokes)
    })


    socket.on('redo', () => {
        redo(userUndoStack, userRedoStack, drawStrokes, socket)
        io.emit('redraw_canvas', drawStrokes)
    })


})
