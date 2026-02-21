import { useEffect, useState, useRef } from "react";

export default function Game() {
    const canvasRef = useRef(null);
    const [brushState, setBrushState] = useState('pen'); // 'pen' or 'eraser'
    const [brushSize, setBrushSize] = useState(5);
    const [strokeCoords, setStrokeCoords] = useState([]);

    const onMouseDownCanvas = (event) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        ctx.lineWidth = brushSize;
        ctx.strokeStyle = brushState === 'pen' ? 'black' : 'white';
        ctx.beginPath();
        ctx.moveTo(x, y);
        setStrokeCoords([{ x, y }]);
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
            setStrokeCoords(prevCoords => [...prevCoords, { x, y }]);
        }
    }

    const handleMouseUpCanvas = async (event) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.closePath();
        const response = await fetch("http://localhost:8080/process", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                points: strokeCoords
            })
        });
        console.log(await response.text());
        setStrokeCoords([]);
    }

    const onClickCanvas = (event) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top; 
        ctx.fillStyle = brushState === 'pen' ? 'black' : 'white';
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
    }

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }


    return (
        <div className="game">
            <h1>Game</h1>
            <div>
                <button onClick={() => setBrushState('pen')}>Pen</button>
                <button onClick={() => setBrushState('eraser')}>Eraser</button>
                <button onClick={clearCanvas}>Clear</button>
                <input type="range" value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))} min="1" max="50" />
            </div>
            <canvas ref={canvasRef} 
            width="800" height="600" 
                style={{ border: "1px solid black", backgroundColor: "white" }} 
                onClick={onClickCanvas}
                onMouseDown={onMouseDownCanvas}
                onMouseMove={handleMouseMoveCanvas}
                onMouseUp={handleMouseUpCanvas}>
                </canvas>
        
        </div>
    )
}