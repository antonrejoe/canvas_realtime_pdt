

function drawing_state_update(stroke, undoStk, redoStk, socket){

    if(!undoStk.has(socket.id)) undoStk.set(socket.id, []);

    // adding to the undo Stack
    undoStk.get(socket.id).push(stroke)
    redoStk.set(socket.id, []);

}

function undo(undoStk, redoStk, drawStrokes, socket, n = 5) { // n strokes to be removed at a time
    const userUndoStk = undoStk.get(socket.id);
    const userRedoStk = redoStk.get(socket.id);

    if (!userUndoStk || userUndoStk.length === 0) return;

    // Remove up to n strokes
    let strokesToUndo = [];
    for (let i = 0; i < n; i++) {
        const lastStroke = userUndoStk.pop();
        if (!lastStroke) break;
        strokesToUndo.push(lastStroke);
    }

    // Remove these strokes from drawStrokes
    strokesToUndo.forEach(stroke => {
        const index = drawStrokes.findIndex(s => s === stroke);
        if (index !== -1) {
            drawStrokes.splice(index, 1);
        }
    });

    // Push all undone strokes to redo stack
    strokesToUndo.forEach(stroke => userRedoStk.push(stroke));
    redoStk.set(socket.id, userRedoStk);
}

function redo(undoStk, redoStk, drawStrokes, socket, n = 5) {
    const userUndoStk = undoStk.get(socket.id);
    const userRedoStk = redoStk.get(socket.id);

    if (!userRedoStk || userRedoStk.length === 0) return;

    // Redo up to n strokes
    let strokesToRedo = [];
    for (let i = 0; i < n; i++) {
        const redoStroke = userRedoStk.pop();
        if (!redoStroke) break;
        strokesToRedo.push(redoStroke);
    }

    // Add strokes back to drawStrokes and undo stack
    strokesToRedo.forEach(stroke => {
        drawStrokes.push(stroke);
        userUndoStk.push(stroke);
    });

    undoStk.set(socket.id, userUndoStk);
    redoStk.set(socket.id, userRedoStk);
}


module.exports = {
  drawing_state_update,
  undo,
  redo,
};