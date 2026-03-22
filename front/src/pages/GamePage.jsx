import { useEffect, useState, useRef } from "react";

export default function GamePage() {
    const canvasRef = useRef(null);
    const [brushState, setBrushState] = useState('pen'); // 'pen' or 'eraser'
    const [brushSize, setBrushSize] = useState(5);
    const [strokeCoords, setStrokeCoords] = useState([]);
    const [predictionData, setPredictionData] = useState(null);

    const onMouseDownCanvas = (event) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const pen = 0;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        ctx.lineWidth = brushSize;
        ctx.strokeStyle = brushState === 'pen' ? 'black' : 'white';
        ctx.beginPath();
        ctx.moveTo(x, y);
        setStrokeCoords(prevCoords => [...prevCoords, { x, y, pen }]);
    }

    const handleMouseMoveCanvas = (event) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (event.buttons === 1) { // Left mouse button
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            const pen = 0;
            ctx.lineTo(x, y);
            ctx.stroke();
            setStrokeCoords(prevCoords => [...prevCoords, { x, y, pen }]);
        }
    }

    const handleMouseUpCanvas = async (event) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.closePath();
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const pen = 1;
        
        // Create the updated coords array with the final point
        // Without it, React updates insachroneously, then the last point isn't sent to the backend
        const updatedCoords = [...strokeCoords, { x, y, pen }];
        setStrokeCoords(updatedCoords);
        
        console.log(updatedCoords)
        const response = await fetch("http://localhost:8080/process", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                points: updatedCoords
            })
        });
        const data = await response.json();
        setPredictionData(data);
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

    const clearCanvas = async () => {
        setStrokeCoords([]);
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
            <div>
                {predictionData ? (
                    <div>
                        <h2>Top Prediction: {predictionData.prediction.category}</h2>
                        <p>Confidence: {(predictionData.prediction.confidence * 100).toFixed(2)}%</p>
                        <h3>Top 10 Predictions:</h3>
                        <ol>
                            {predictionData.top10.map((pred, index) => (
                                <li key={index}>
                                    {pred.category} - {(pred.confidence * 100).toFixed(2)}%
                                </li>
                            ))}
                        </ol>
                    </div>
                ) : (
                    <p>Draw something to get predictions!</p>
                )}
            </div>
        
        </div>
    )
}
