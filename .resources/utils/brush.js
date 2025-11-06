const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

export function drawNormal (size, prevX, prevY, currX, currY, color){
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(currX, currY);
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.closePath();
}

// Spray brush
export function drawSpray (size, prevX, prevY, currX, currY, color) {
    const density = 20;
    const radius = size * 2;
    
    for (let i = 0; i < density; i++) {
        const offsetX = (Math.random() - 0.5) * radius;
        const offsetY = (Math.random() - 0.5) * radius;
        
        ctx.fillStyle = color;
        ctx.fillRect(currX + offsetX, currY + offsetY, 1, 1);
    }
}

// Calligraphy brush
export function drawCalligraphy (size, prevX, prevY, currX, currY, color) {
    const dx = currX - prevX;
    const dy = currY - prevY;
    const angle = Math.atan2(dy, dx);
    const width = Math.abs(Math.sin(angle)) * size * 2 + 2;
    
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(currX, currY);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.closePath();
}

// Sketchy brush
export function drawSketchy (size, prevX, prevY, currX, currY, color) {
    const lines = 3;
    
    for (let i = 0; i < lines; i++) {
        const offset = (Math.random() - 0.5) * size;
        
        ctx.beginPath();
        ctx.moveTo(prevX + offset, prevY + offset);
        ctx.lineTo(currX + offset, currY + offset);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.3;
        ctx.stroke();
        ctx.closePath();
    }
    ctx.globalAlpha = 1.0;
}

// Marker brush
export function drawMarker (size, prevX, prevY, currX, currY, color) {
    ctx.shadowBlur = 2;
    ctx.shadowColor = color;
    ctx.globalAlpha = 0.6;
    
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(currX, currY);
    ctx.strokeStyle = color;
    ctx.lineWidth = size * 2;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.closePath();
    
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1.0;
}

// Fur brush
export function drawFur (size, prevX, prevY, currX, currY, color) {
    const strands = 10;
    const length = size * 2;
    
    for (let i = 0; i < strands; i++) {
        const angle = Math.random() * Math.PI * 2;
        const endX = currX + Math.cos(angle) * length;
        const endY = currY + Math.sin(angle) * length;
        
        ctx.beginPath();
        ctx.moveTo(currX, currY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.2;
        ctx.stroke();
        ctx.closePath();
    }
    ctx.globalAlpha = 1.0;
}
