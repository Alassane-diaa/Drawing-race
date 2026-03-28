import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const WS_BASE_URL = 'http://localhost:8080/ws';
const MAIN_CANVAS_WIDTH = 800;
const MAIN_CANVAS_HEIGHT = 600;
const OPPONENT_CANVAS_WIDTH = 400;
const OPPONENT_CANVAS_HEIGHT = 300;

export default function GamePage() {
    const canvasRef = useRef(null);
    const canvasRefOpponent = useRef(null);
    const stompClientRef = useRef(null);
    const currentStrokeRef = useRef([]);
    const opponentStrokesRef = useRef([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [brushState, setBrushState] = useState('pen'); // 'pen' or 'eraser'
    const [brushSize, setBrushSize] = useState(5);
    const [strokeCoords, setStrokeCoords] = useState([]);
    const [predictionData, setPredictionData] = useState(null);
    const [targetCategory, setTargetCategory] = useState("");
    // Pour timer
    const [isActive, setIsActive] = useState(false);
    const [hasStartedGame, setHasStartedGame] = useState(false);
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

    const clearOpponentCanvas = () => {
        const canvas = canvasRefOpponent.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const splitPointsIntoStrokes = (points) => {
        const strokes = [];
        let currentStroke = [];

        points.forEach((point) => {
            if (!Number.isFinite(point?.x) || !Number.isFinite(point?.y)) {
                return;
            }

            currentStroke.push(point);

            if (point.pen === 1) {
                if (currentStroke.length > 0) {
                    strokes.push(currentStroke);
                }
                currentStroke = [];
            }
        });

        if (currentStroke.length > 0) {
            strokes.push(currentStroke);
        }

        return strokes;
    };

    const drawCenteredOnOpponentCanvas = (strokes) => {
        const canvas = canvasRefOpponent.current;
        if (!canvas || !strokes || strokes.length === 0) {
            clearOpponentCanvas();
            return; 
        }

        const validPoints = strokes.flat().filter(
            (point) => Number.isFinite(point?.x) && Number.isFinite(point?.y)
        );

        if (validPoints.length === 0) {
            clearOpponentCanvas();
            return;
        }

        const minX = Math.min(...validPoints.map((point) => point.x));
        const maxX = Math.max(...validPoints.map((point) => point.x));
        const minY = Math.min(...validPoints.map((point) => point.y));
        const maxY = Math.max(...validPoints.map((point) => point.y));

        const drawingWidth = Math.max(maxX - minX, 1);
        const drawingHeight = Math.max(maxY - minY, 1);
        const fitScale = Math.min(
            (canvas.width * 0.9) / drawingWidth,
            (canvas.height * 0.9) / drawingHeight
        );
        const scale = Math.max(0.1, fitScale);

        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;

        const transformPoint = (point) => ({
            x: (point.x - centerX) * scale + canvas.width / 2,
            y: (point.y - centerY) * scale + canvas.height / 2,
            pen: point.pen,
        });

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.lineWidth = 4;
        ctx.strokeStyle = 'black';

        strokes.forEach((stroke) => {
            const transformedStroke = stroke
                .filter((point) => Number.isFinite(point?.x) && Number.isFinite(point?.y))
                .map(transformPoint);

            if (transformedStroke.length === 0) {
                return;
            }

            if (transformedStroke.length === 1) {
                const point = transformedStroke[0];
                ctx.beginPath();
                ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
                ctx.fillStyle = 'black';
                ctx.fill();
                ctx.closePath();
                return;
            }

            ctx.beginPath();
            ctx.moveTo(transformedStroke[0].x, transformedStroke[0].y);
            for (let index = 1; index < transformedStroke.length; index += 1) {
                const point = transformedStroke[index];
                ctx.lineTo(point.x, point.y);
            }
            ctx.stroke();
            ctx.closePath();
        });
    };

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

                const incomingPoints = payload.stroke?.points || [];
                if (incomingPoints.length === 0) {
                    opponentStrokesRef.current = [];
                    clearOpponentCanvas();
                    return;
                }

                const incomingStrokes = splitPointsIntoStrokes(incomingPoints);
                opponentStrokesRef.current = [...opponentStrokesRef.current, ...incomingStrokes];
                drawCenteredOnOpponentCanvas(opponentStrokesRef.current);
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
        setHasStartedGame(true);
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
        if (hasStartedGame && predictionData && predictionData.prediction.category === targetCategory && predictionData.prediction.confidence >= palierConfidence) {
            setIsActive(false); // Stop le timer
            alert("Congratulations! The AI recognized your drawing!");
            // Enlever les alertes euh et lier tot ça à la difficulté
        }
    }, [hasStartedGame, predictionData, targetCategory, palierConfidence]);

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
        setIsDrawing(true);
        currentStrokeRef.current = [{ x, y, pen }];
    }

    const handleMouseMoveCanvas = (event) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!isDrawing) return;
        if (event.buttons === 1) { // Left mouse button
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            const pen = 0;
            ctx.lineTo(x, y);
            ctx.stroke();
            currentStrokeRef.current.push({ x, y, pen });
        }
    }

    const handleMouseUpCanvas = async (event) => {
        if (!isDrawing) return;
        setIsDrawing(false);

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.closePath();
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const pen = 1;

        const finishedStroke = [...currentStrokeRef.current, { x, y, pen }];
        currentStrokeRef.current = [];

        const updatedCoords = [...strokeCoords, ...finishedStroke];
        setStrokeCoords(updatedCoords);

        if (multiplayer && stompClientRef.current?.connected && gameId && playerName) {
            stompClientRef.current.publish({
                destination: `/app/game/${gameId}/stroke`,
                body: JSON.stringify({
                    playerName,
                    stroke: {
                        points: finishedStroke,
                    },
                }),
            });
        }

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

        const clickPoint = { x, y, pen: 1 };
        const updatedCoords = [...strokeCoords, clickPoint];
        setStrokeCoords(updatedCoords);

        if (multiplayer && stompClientRef.current?.connected && gameId && playerName) {
            stompClientRef.current.publish({
                destination: `/app/game/${gameId}/stroke`,
                body: JSON.stringify({
                    playerName,
                    stroke: {
                        points: [clickPoint],
                    },
                }),
            });
        }
    }

    const clearCanvas = async () => {
        setStrokeCoords([]);
        currentStrokeRef.current = [];
        setIsDrawing(false);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (multiplayer && stompClientRef.current?.connected && gameId && playerName) {
            stompClientRef.current.publish({
                destination: `/app/game/${gameId}/stroke`,
                body: JSON.stringify({
                    playerName,
                    stroke: {
                        points: [],
                    },
                }),
            });
        }
    }

    return (
        <div className="game">
            <h1>Quick, Draw:</h1>

            <div className="CategoryADessiner">
                {hasStartedGame && targetCategory ? (
                    <h2>{"->"} <strong> {targetCategory} </strong> {"<-"}</h2>
                ) : (
                    <p>Clique sur "Commencer la partie" </p>
                )}
            </div>

            <div>
                {hasStartedGame ? `00:${timeLeft < 10 ? `0${timeLeft}` : timeLeft}` : '--:--'}
            </div>

            <div>
                <button className = "grosBouton" onClick={startNewGame}>Commencer la partie</button>
            </div>

            <div>
                <button className = "Tool" onClick={() => setBrushState('pen')}>Pen</button>
                <button className = "Tool" onClick={() => setBrushState('eraser')}>Eraser</button>
                <button className = "Tool" onClick={clearCanvas}>Clear</button>
                <input type="range" value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))} min="1" max="50" />
            </div>
            <canvas ref={canvasRef} 
                width={MAIN_CANVAS_WIDTH} height={MAIN_CANVAS_HEIGHT}
                style={{ border: "1px solid black", backgroundColor: "white" }} 
                onClick={onClickCanvas}
                onMouseDown={onMouseDownCanvas}
                onMouseMove={handleMouseMoveCanvas}
                onMouseUp={handleMouseUpCanvas}>
            </canvas>
        
            {multiplayer && (
                <canvas ref={canvasRefOpponent} 
                    width={OPPONENT_CANVAS_WIDTH} height={OPPONENT_CANVAS_HEIGHT}
                    style={{ border: "1px solid black", backgroundColor: "white", pointerEvents: "none" }} >
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
