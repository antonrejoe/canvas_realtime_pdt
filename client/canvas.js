const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

draw_status = false
w = canvas.width;
h = canvas.height;
color = 'black'
size = 4
// coordinates
prevX = 0, currX = 0, prevY = 0, currY = 0;


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

function draw(){
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(currX, currY)
    ctx.strokeStyle = color;
    ctx.lineWidth   = size;
    ctx.stroke();
    ctx.closePath();
}

function update_coords(mouse_state, e){
    if(mouse_state == 'down'){
        draw_status = true

        prevX = currX
        prevY = currY

        currX = e.clientX - canvas.offsetLeft;
        currY = e.clientY - canvas.offsetTop;

        // dot at the current location
        ctx.beginPath();
        ctx.fillStyle = x;
        ctx.fillRect(currX, currY, 4, 4);
        ctx.closePath();
    }
    
    if(mouse_state == 'move'){
        if (draw_status){
            prevX = currX;
            prevY = currY;
            currX = e.clientX - canvas.offsetLeft;
            currY = e.clientY - canvas.offsetTop;
            draw();
        }
    }
    
    if(mouse_state == 'up' || mouse_state == 'out'){
        draw_status = false
    }

}