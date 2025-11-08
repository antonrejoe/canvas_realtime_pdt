
const io = require('socket.io')(3000,{
    cors:{
        origin: ["http://127.0.0.1:5500"],
    },
});

// Assigning color to user

const assignedColors = new Set()
const userColors     = new Map()
let   drawStrokes    = []

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

        socket.broadcast.emit('user-left', {
            userId: socket.id
        })
    })


    socket.on('drawing_event', data => {
        drawStrokes.push(data)

        socket.broadcast.emit('drawing_from_other_user', {
            item : data
        })
    } )

    socket.on('clear_user_drawing', () => {
        console.log(socket.id, 'user cleared his canvas')

        drawStrokes = drawStrokes.filter(stroke => {
            stroke.userId !== socket.id
        })

        socket.broadcast.emit('redraw_canvas', drawStrokes)
    })


})

