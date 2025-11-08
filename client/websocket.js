import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js"
import {drawNormal, drawCalligraphy, drawFur, drawMarker, drawSketchy, drawSpray} from '../.resources/utils/brush.js';
import {draw, ctx,w,h} from './canvas.js'

const socket = io('http://localhost:3000')
const userCursors = new Map();

// tracking events
/*
Events to be tracked
    - Joining of user
    - Leaving of user
    - drawing/erasing (includes color change)
    - undo/redo

*/

// joining event

socket.on('connected', (data) =>{
    const userId = data.userId
    const userColor = data.color

    const follower = document.getElementById('follower')
    follower.style.backgroundColor = userColor

})

// sending the mouse coordinates
document.addEventListener('mousemove', e => {

    socket.emit('client_mouse_coordinates', {
        x : e.clientX,
        y : e.clientY
    })
})

// receiving other user mouse coordinates
socket.on('other_user_coordinates', data => {
    const  color = data.color
    const  id    = data.id
    const  x     = data.coord.x
    const  y     = data.coord.y

    let newDiv = userCursors.get(id)

    if(!newDiv){
        newDiv = document.createElement('div');
        newDiv.id = id;
        newDiv.classList.add('cursor_anchor_styling');
        newDiv.style.backgroundColor = color

        document.body.appendChild(newDiv)
        userCursors.set(id, newDiv);

    }
    newDiv.style.left = `${x}px`;
    newDiv.style.top  = `${y}px`;
})


socket.on('user-left', data => {
    const cursorDiv = userCursors.get(data.userId)

    if(cursorDiv){
        userCursors.delete(data.userId)
        cursorDiv.remove()
    }
})

socket.on('drawing_from_other_user', data => {
    
    const size = data.item.size
    const cX   = data.item.cX
    const cY   = data.item.cY
    const pX   = data.item.pX
    const pY   = data.item.pY
    const color = data.item.color
    const brush = data.item.brush

    draw(size,pX,pY,cX,cY,color,brush)
})


socket.on('canvas-state', allStrokes => {
    allStrokes.forEach(stroke => {
        draw(stroke.size, stroke.pX, stroke.pY, stroke.cX, stroke.cY, stroke.color, stroke.brush)
    });
})

socket.on('redraw_canvas', allStrokes =>{
    ctx.clearRect(0,0,w,h);

    allStrokes.forEach(stroke => {
        draw(stroke.size, stroke.pX, stroke.pY, stroke.cX, stroke.cY, stroke.color, stroke.brush)
    });
})


function undo(e){
    socket.emit('undo')    
}

function redo(e){
    socket.emit('redo')    

}

export default socket;

window.undo = undo;
window.redo = redo;