import {drawNormal, drawCalligraphy, drawFur, drawMarker, drawSketchy, drawSpray} from '../.resources/utils/brush.js';
import socket from './websocket.js';

const canvas = document.getElementById('canvas');
export const ctx = canvas.getContext('2d');

var draw_btn_status = false;
var draw_status = false;
var eraser_status = false;
export const w = canvas.width;
export const h = canvas.height;


// coordinates
var prevX = 0, currX = 0, prevY = 0, currY = 0;


// Stroke size selection
const strkSizeSlider = document.getElementById('stroke_size')
var size = strkSizeSlider.value

strkSizeSlider.addEventListener('input', () => {
    size = strkSizeSlider.value
})


// Color picker
const colorPicker = document.getElementById('stroke_color_picker')
var color = colorPicker.value

colorPicker.addEventListener('change', ()=>{
    color = colorPicker.value;
})

// Brush selection

const brushPicker = document.getElementById('brush_picker')
var brushType = brushPicker.value

brushPicker.addEventListener('change', (e)=>{
    brushType = e.target.value;
})

function update_draw_stat(e){
    if(draw_btn_status){
        draw_btn_status = false
        e.classList.remove('draw_toggle_indication');
    }else{
        draw_btn_status = true
        e.classList.add('draw_toggle_indication');
    }
}

// eraser

function eraser_on(e){
    if (eraser_status){
        eraser_status = false
        e.classList.remove('eraser_toggle_indication')
        color = colorPicker.value
        brushType = brushPicker.value
    }else{
        eraser_status = true
        color = 'aliceblue'
        brushType = 'normal'
        e.classList.add('eraser_toggle_indication')
    }
}

function init_Canvas(){
    canvas.addEventListener('mousemove', e => {
        update_coords('move', e);
    })
    canvas.addEventListener('mousedown', e => {
        update_coords('down', e);
    })
    canvas.addEventListener('mouseup', e => {
        update_coords('up', e);
    })
    canvas.addEventListener('mouseout', e => {
        update_coords('out', e);
    })
}

export function draw(size, prevX, prevY, currX, currY, color, brushType){
    let draw_tool = 'normal';
    switch(brushType) {
        case 'normal':
            drawNormal(size, prevX, prevY, currX, currY, color)
            draw_tool = 'normal'
            break;
        case 'spray':
            drawSpray (size, prevX, prevY, currX, currY, color);
            draw_tool = 'spray'
            break;
        case 'calligraphy':
            drawCalligraphy (size, prevX, prevY, currX, currY, color);
            draw_tool = 'calligraphy'
            break;
        case 'sketchy':
            drawSketchy (size, prevX, prevY, currX, currY, color);
            draw_tool = 'sketchy'
            break;
        case 'marker':
            drawMarker (size, prevX, prevY, currX, currY, color);
            draw_tool = 'marker'
            break;
        case 'fur':
            drawFur (size, prevX, prevY, currX, currY, color);
            draw_tool = 'fur'
            break;
        default:
            drawNormal(size, prevX, prevY, currX, currY, color);
            draw_tool = 'normal'
    }

    return draw_tool
}

function clearCanvas() {
    ctx.clearRect(0, 0, w, h);
    socket.emit('clear_user_drawing', {userId: socket.id});
}


function update_coords(mouse_state, e){
    
    // Only allow drawing if draw button is ON, OR if eraser is ON
    if(mouse_state == 'down' && (draw_btn_status || eraser_status)){
        draw_status = true

        prevX = currX
        prevY = currY

        currX = e.clientX - canvas.offsetLeft;
        currY = e.clientY - canvas.offsetTop;

        // dot at the current location
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.fillRect(currX, currY, 2, 2);
        ctx.closePath();
    }
    
    if(mouse_state == 'move' && (draw_btn_status || eraser_status)){
        if (draw_status){
            prevX = currX;
            prevY = currY;
            currX = e.clientX - canvas.offsetLeft;
            currY = e.clientY - canvas.offsetTop;
            let brushTypex = draw(size, prevX, prevY, currX, currY, color, brushType);

            socket.emit('drawing_event', {
                userId  : socket.id,
                size    : size,
                cX      : currX,
                cY      : currY,
                pX      : prevX,
                pY      : prevY,
                color   : color,
                brush   : brushTypex
            })
        }
    }
    
    if(mouse_state == 'up' || mouse_state == 'out'){
        draw_status = false
    }
}


// --- expose functions to HTML ---
window.init_Canvas = init_Canvas;
window.clearCanvas = clearCanvas;
window.update_coords = update_coords;
window.update_draw_stat = update_draw_stat;
window.eraser_on = eraser_on;
