const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
ctx.fillStyle = 'orange'
ctx.fillRect(100,20,100,100)


function handleMouseMove(event){
    canvas_posn = canvas.getBoundingClientRect();

    const moveX = event.clientX - canvas_posn.left;
    const moveY = event.clientY - canvas_posn.top;

    console.log(`Move X: ${moveX}, Move Y: ${moveY}`);
    
}

canvas.addEventListener('mouseover', () =>{
    canvas.addEventListener('mousemove', handleMouseMove)
})

canvas.addEventListener('mouseout', () =>{
    canvas.removeEventListener('mousemove', handleMouseMove)
})