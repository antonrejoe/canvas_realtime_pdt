

function drawing_state_update(stroke, undoStk, redoStk, socket){

    if(!undoStk.has(socket.id)) undoStk.set(socket.id, []);

    // adding to the undo Stack
    undoStk.get(socket.id).push(stroke)
    redoStk.set(socket.id, []);

}

function undo(undoStk, redoStk, drawStrokes, socket){
    const userUndoStk = undoStk.get(socket.id)
    const userRedoStk = redoStk.get(socket.id)

    if(!userUndoStk || userUndoStk.length === 0) return;

    const lastStroke = userUndoStk.pop();

    if(lastStroke){
        
        const index = drawStrokes.findIndex(s => s === lastStroke);
        if (index !== -1) {
            drawStrokes.splice(index, 1);
        } // removal of the last stroke

    }

    userRedoStk.push(lastStroke)
    redoStk.set(socket.id, userRedoStk)

}


function redo(undoStk, redoStk, drawStrokes, socket){
    const userUndoStk = undoStk.get(socket.id)
    const userRedoStk = redoStk.get(socket.id)

    if(!userRedoStk || userRedoStk.length === 0) return;

    const redoStroke = userRedoStk.pop()

    if(redoStroke){
        drawStrokes.push(redoStroke)
        userUndoStk.push(redoStroke)

        undoStk.set(socket.id, userUndoStk)
        redoStk.set(socket.id, userRedoStk)
    }

}



module.exports = {
  drawing_state_update,
  undo,
  redo,
};