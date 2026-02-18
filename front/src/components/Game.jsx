import { useEffect, useState, useRef } from "react";

export default function Game() {
    const canvasRef = useRef(null);

    const onMouseDownCanvas = (event) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        ctx.beginPath();
        ctx.moveTo(x, y);
    }

    const handleMouseMoveCanvas = (event) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (event.buttons === 1) { // Left mouse button
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            ctx.lineTo(x, y);
            ctx.stroke();
        }
    }
    return (
        <div className="game">
            <h1>Game</h1>
            <canvas ref={canvasRef} 
            width="800" height="600" 
                style={{ border: "1px solid black" }} 
                onMouseDown={onMouseDownCanvas}
                onMouseMove={handleMouseMoveCanvas}>
                </canvas>
        
        </div>
    )
}