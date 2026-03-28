import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const WS_BASE_URL = 'http://localhost:8080/ws';

export default function GamePage() {
    const canvasRef = useRef(null);
    const canvasRefOpponent = useRef(null);
    const stompClientRef = useRef(null);
    const [brushState, setBrushState] = useState('pen'); // 'pen' or 'eraser'
    const [brushSize, setBrushSize] = useState(5);
    const [strokeCoords, setStrokeCoords] = useState([]);
    const [predictionData, setPredictionData] = useState(null);
    const [targetCategory, setTargetCategory] = useState("");
    // Pour timer
    const [isActive, setIsActive] = useState(false);
    // Difficulty
    const location = useLocation();
    const multiplayer = Boolean(location.state?.multiplayer);
    const gameId = location.state?.gameId;
    const playerName = location.state?.playerName;
    const selectedDifficulty = location.state?.difficulty || "medium";

    // Selon la difficulté
    const getInitialTime = () => {
        if (selectedDifficulty === "easy") return 20;
        if (selectedDifficulty === "hard") return 10;
        return 15;
    };
    const [timeLeft, setTimeLeft] = useState(getInitialTime());
    const getInitialPalier = () => {
        if (selectedDifficulty === "easy") return 0.8;
        if (selectedDifficulty === "hard") return 0.99;
        return 0.9;
    };
    const palierConfidence = useState(getInitialPalier())[0];

    const drawStrokeOnCanvas = (canvas, points) => {
        if (!canvas || !points || points.length === 0) {
            return; 
        }

        const ctx = canvas.getContext('2d');
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.lineWidth = 4;
        ctx.strokeStyle = 'black';

        const [firstPoint, ...restPoints] = points;
        ctx.beginPath();
        ctx.moveTo(firstPoint.x, firstPoint.y);

        restPoints.forEach((point) => {
            if (point.pen === 1) {
                ctx.stroke();
                ctx.closePath();
                ctx.beginPath();
                ctx.moveTo(point.x, point.y);
                return;
            }
            ctx.lineTo(point.x, point.y);
        });

        ctx.stroke();
        ctx.closePath();
    };


    useEffect(() => {
        startNewGame();
    }, []);

    useEffect(() => {
        if (!multiplayer || !gameId) {
            return;
        }

        const client = new Client({
            webSocketFactory: () => new SockJS(WS_BASE_URL),
            reconnectDelay: 5000,
        });

        client.onConnect = () => {
            client.subscribe(`/topic/game/${gameId}/stroke`, (frame) => {
                const payload = JSON.parse(frame.body);
                if (payload.playerName === playerName) {
                    return;
                }
                drawStrokeOnCanvas(canvasRefOpponent.current, payload.stroke?.points || []);
            });
        };

        client.activate();
        stompClientRef.current = client;

        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
            }
        };
    }, [multiplayer, gameId, playerName]);

    // Compte à rebours
    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((time) => time - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            clearInterval(interval);
            handleTimeUp();
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const startNewGame = async () => {
        await fetchRandomCategory();
        setTimeLeft(getInitialTime())
        setIsActive(true);
        clearCanvas();
    };

    const handleTimeUp = () => {
        alert(`Time's Up ! You had to draw: ${targetCategory}`);
        // Enlever les alerts et afficher la page suivante
        //
        //
    };
    // Gestion Victoire
    useEffect(() => {
        if (predictionData && predictionData.prediction.category === targetCategory && predictionData.prediction.confidence >= palierConfidence) {
            setIsActive(false); // Stop le timer
            alert("Congratulations! The AI recognized your drawing!");
            // Enlever les alertes euh et lier tot ça à la difficulté
        }
    }, [predictionData, targetCategory]);

    const fetchRandomCategory = async () => {
        try {
            const response = await fetch("http://localhost:8080/random-category");
            const data = await response.json();
            setTargetCategory(data.category);
        } catch (error) {
            console.error("Erreur lors du chargement de la catégorie :", error);
        }
    };

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
        if (!isActive) return;
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

        if (multiplayer && stompClientRef.current?.connected && gameId && playerName) {
            stompClientRef.current.publish({
                destination: `/app/game/${gameId}/stroke`,
                body: JSON.stringify({
                    playerName,
                    stroke: {
                        points: updatedCoords,
                    },
                }),
            });
        }
        
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

        if (canvasRefOpponent.current) {
            const opponentCtx = canvasRefOpponent.current.getContext('2d');
            opponentCtx.clearRect(0, 0, canvasRefOpponent.current.width, canvasRefOpponent.current.height);
        }
    }

    return (
        <div className="game">
            <h1>Quick, Draw:</h1>

            <div className="CategoryADessiner">
                {targetCategory ? (
                    <h2>{"->"} <strong> {targetCategory} </strong> {"<-"}</h2>
                ) : (
                    <p>Loading...</p>
                )}
            </div>

            <div>
                00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
            </div>

            <div>
                <button className = "grosBouton" onClick={startNewGame}>Start / Reset</button>
            </div>

            <div>
                <button className = "Tool" onClick={() => setBrushState('pen')}>Pen</button>
                <button className = "Tool" onClick={() => setBrushState('eraser')}>Eraser</button>
                <button className = "Tool" onClick={clearCanvas}>Clear</button>
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
        
            {multiplayer && (
                <canvas ref={canvasRefOpponent} 
                    width="400" height="300" 
                    style={{ border: "1px solid black", backgroundColor: "white" }} >
                </canvas>
            )}
            
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
