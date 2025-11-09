import {drawNormal, drawCalligraphy, drawFur, drawMarker, drawSketchy, drawSpray} from './.resources/utils/brush.js';
import socket from './websocket.js';

const canvas = document.getElementById('canvas');
export const ctx = canvas.getContext('2d');

var draw_btn_status = false;
var draw_status = false;
var eraser_status = false;

export const w = canvas.width;
export const h = canvas.height;

// Get canvas bounding rectangle for accurate offset calculation
function getCanvasOffset() {
    const rect = canvas.getBoundingClientRect();
    return {
        left: rect.left,
        top: rect.top
    };
}

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
        color = 'white'
        brushType = 'normal'
        e.classList.add('eraser_toggle_indication')
    }
}

// Mobile detection
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

function init_Canvas(){
    // Desktop events
    canvas.addEventListener('mousemove', e => {
        if (!isMobile) update_coords('move', e);
    })
    canvas.addEventListener('mousedown', e => {
        if (!isMobile) update_coords('down', e);
    })
    canvas.addEventListener('mouseup', e => {
        if (!isMobile) update_coords('up', e);
    })
    canvas.addEventListener('mouseout', e => {
        if (!isMobile) update_coords('out', e);
    })

    // Mobile touch events
    canvas.addEventListener('touchstart', e => {
        e.preventDefault();
        if (isMobile && e.touches.length > 0) {
            const touch = e.touches[0];
            const touchEvent = {
                clientX: touch.clientX,
                clientY: touch.clientY
            };
            update_coords('down', touchEvent);
        }
    }, { passive: false });

    canvas.addEventListener('touchmove', e => {
        e.preventDefault();
        if (isMobile && e.touches.length > 0) {
            const touch = e.touches[0];
            const touchEvent = {
                clientX: touch.clientX,
                clientY: touch.clientY
            };
            update_coords('move', touchEvent);
        }
    }, { passive: false });

    canvas.addEventListener('touchend', e => {
        e.preventDefault();
        if (isMobile) {
            update_coords('up', { clientX: currX, clientY: currY });
        }
    }, { passive: false });

    canvas.addEventListener('touchcancel', e => {
        e.preventDefault();
        if (isMobile) {
            update_coords('out', { clientX: currX, clientY: currY });
        }
    }, { passive: false });
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
    // Get accurate canvas offset using getBoundingClientRect
    const offset = getCanvasOffset();
    
    // Only allow drawing if draw button is ON, OR if eraser is ON
    if(mouse_state == 'down' && (draw_btn_status || eraser_status)){
        draw_status = true
        prevX = currX
        prevY = currY
        currX = e.clientX - offset.left;
        currY = e.clientY - offset.top;
        
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
            currX = e.clientX - offset.left;
            currY = e.clientY - offset.top;
            let brushTypex = draw(size, prevX, prevY, currX, currY, color, brushType);
            
            const encodedStroke = msgpack.encode({
                userId: socket.id,
                size,
                cX: currX,
                cY: currY,
                pX: prevX,
                pY: prevY,
                color,
                brush: brushTypex
            });
            socket.emit('drawing_event', encodedStroke)
        }
    }
    
    if(mouse_state == 'up' || mouse_state == 'out'){
        draw_status = false
    }
}

// Mobile-specific button toggle for drawing
if (isMobile) {
    // Auto-enable drawing on mobile
    draw_btn_status = true;
    const drawBtn = document.querySelector('[onclick*="update_draw_stat"]');
    if (drawBtn) {
        drawBtn.classList.add('draw_toggle_indication');
    }
}

// --- expose functions to HTML ---
window.init_Canvas = init_Canvas;
window.clearCanvas = clearCanvas;
window.update_coords = update_coords;
window.update_draw_stat = update_draw_stat;
window.eraser_on = eraser_on;
