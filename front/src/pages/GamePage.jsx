import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './GamePage.css';

// Services
import {
    getGameState,
    markPlayerReady,
    markPlayerNotReady,
    startGame as startMultiplayerGame,
    leaveLobby,
    deleteLobby
} from '../services/gameService';
import {
    splitPointsIntoStrokes,
    drawCenteredOnCanvas
} from '../services/canvasService';

// Hooks
import { useGameWebsocket, publishStroke } from '../hooks/useGameWebsocket';
import { useCanvasDrawing } from '../hooks/useCanvasDrawing';
import { useGameLogic } from '../hooks/useGameLogic';

// Components
import ReadyUpUI from '../components/ReadyUpUI';
import GameTools from '../components/GameTools';
import PredictionDisplay from '../components/PredictionDisplay';

// Constants
const MAIN_CANVAS_WIDTH = 800;
const MAIN_CANVAS_HEIGHT = 600;
const OPPONENT_CANVAS_WIDTH = 400;
const OPPONENT_CANVAS_HEIGHT = 300;
const MULTIPLAYER_SESSION_KEY = 'multiplayerSession';

export default function GamePage() {
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const canvasRefOpponent = useRef(null);
    const opponentStrokesRef = useRef([]);

    // Location state
    const location = useLocation();
    const storedSession = (() => {
        try {
            const rawSession = localStorage.getItem(MULTIPLAYER_SESSION_KEY);
            return rawSession ? JSON.parse(rawSession) : null;
        } catch (error) {
            console.warn('Unable to read multiplayer session:', error);
            return null;
        }
    })();

    // Game mode state
    const multiplayer = Boolean(location.state?.multiplayer ?? storedSession?.multiplayer);
    const gameId = location.state?.gameId || storedSession?.gameId;
    const playerName = location.state?.playerName || storedSession?.playerName;
    const selectedDifficulty = location.state?.difficulty || 'medium';
    const initialGameState = location.state?.gameState;

    // Local state
    const [gameReady, setGameReady] = useState(!multiplayer || initialGameState?.status === 'STARTED');
    const [gameState, setGameState] = useState(initialGameState);
    const [errorMessage, setErrorMessage] = useState('');

    // Save multiplayer session
    useEffect(() => {
        if (!multiplayer || !gameId || !playerName) {
            return;
        }

        try {
            localStorage.setItem(MULTIPLAYER_SESSION_KEY, JSON.stringify({
                gameId,
                playerName,
                multiplayer: true,
            }));
        } catch (error) {
            console.warn('Unable to persist multiplayer session:', error);
        }
    }, [multiplayer, gameId, playerName]);

    // Restore game state from server (only if not already provided via redirect)
    useEffect(() => {
        if (!multiplayer || !gameId || initialGameState?.status === 'STARTED') {
            return; // Don't fetch if already in game or not multiplayer
        }

        let isCancelled = false;

        const fetchCurrentGameState = async () => {
            try {
                const state = await getGameState(gameId);
                if (isCancelled) return;

                setGameState(state);
                if (state.status === 'STARTED') {
                    setGameReady(true);
                }
            } catch (error) {
                console.error('Unable to restore game state:', error);
            }
        };

        fetchCurrentGameState();

        return () => {
            isCancelled = true;
        };
    }, [multiplayer, gameId]);

    // Game logic hook
    const gameLogic = useGameLogic(selectedDifficulty, handleTimeUp, handleVictory);

    // Canvas drawing hook
    const drawingControl = useCanvasDrawing(
        canvasRef,
        handleStrokeComplete,
        handleCanvasClear
    );

    // WebSocket hook for game updates
    const { clientRef: stompClientRef } = useGameWebsocket({
        gameId,
        playerName,
        enabled: multiplayer && gameId && playerName,
        onStrokeReceived: handleOpponentStroke,
        onGameEvent: handleGameEvent,
        onGameStateChanged: handleGameStateChanged
    });

    // ============ Event Handlers ============

    function handleOpponentStroke(payload) {
        const incomingPoints = payload.stroke?.points || [];

        if (incomingPoints.length === 0) {
            opponentStrokesRef.current = [];
            drawCenteredOnCanvas(canvasRefOpponent.current, []);
            return;
        }

        const incomingStrokes = splitPointsIntoStrokes(incomingPoints);

        opponentStrokesRef.current = [...opponentStrokesRef.current, ...incomingStrokes];
        drawCenteredOnCanvas(canvasRefOpponent.current, opponentStrokesRef.current);
    }

    function handleGameEvent(gameEvent) {
        setErrorMessage('');
        if (gameEvent.type === 'GAME_STARTED') {
            setGameReady(true);
        }

        if (gameEvent.type === 'GAME_DELETED') {
            try {
                localStorage.removeItem(MULTIPLAYER_SESSION_KEY);
            } catch (error) {
                console.warn('Unable to clear multiplayer session:', error);
            }
            navigate('/play');
        }
    }

    function handleGameStateChanged(state) {
        setErrorMessage('');
        setGameState(state);
        if (state.status === 'STARTED') {
            setGameReady(true);
        }
    }

    async function handleStrokeComplete(finishedStroke, updatedCoords) {
        const activeClient = stompClientRef.current;

        // Publish to multiplayer
        if (multiplayer && gameId && playerName && activeClient?.connected) {
            publishStroke(activeClient, gameId, playerName, finishedStroke);
        }

        // Get AI prediction
        await gameLogic.fetchAndProcessDrawing(updatedCoords);
    }

    function handleCanvasClear() {
        const activeClient = stompClientRef.current;

        // Publish clear event to multiplayer
        if (multiplayer && gameId && playerName && activeClient?.connected) {
            publishStroke(activeClient, gameId, playerName, []);
        }
    }

    function handleTimeUp(category) {
        alert(`Time'\''s Up! You had to draw: ${category}`);
        gameLogic.resetGame();
    }

    function handleVictory(category, confidence) {
        alert(`Congratulations! The AI recognized your drawing: ${category} (${(confidence * 100).toFixed(2)}%)`);
        gameLogic.resetGame();
    }

    // ============ Multiplayer Handlers ============

    async function handleMarkReady() {
        if (!multiplayer || !gameId) return;

        try {
            setErrorMessage('');
            const updatedGame = await markPlayerReady(gameId, playerName);
            setGameState(updatedGame);
        } catch (error) {
            setErrorMessage(`Failed to mark as ready: ${error.message}`);
        }
    }

    async function handleMarkNotReady() {
        if (!multiplayer || !gameId) return;

        try {
            setErrorMessage('');
            const updatedGame = await markPlayerNotReady(gameId, playerName);
            setGameState(updatedGame);
        } catch (error) {
            setErrorMessage(`Failed to mark as not ready: ${error.message}`);
        }
    }

    async function handleStartGame() {
        if (!multiplayer || !gameId) return;

        try {
            setErrorMessage('');
            await startMultiplayerGame(gameId, playerName);
        } catch (error) {
            setErrorMessage(`Cannot start game: ${error.message}`);
        }
    }

    async function handleLeaveLobby() {
        if (!multiplayer || !gameId || !playerName) return;

        try {
            setErrorMessage('');
            await leaveLobby(gameId, playerName);
            localStorage.removeItem(MULTIPLAYER_SESSION_KEY);
            navigate('/play');
        } catch (error) {
            setErrorMessage(`Cannot leave lobby: ${error.message}`);
        }
    }

    async function handleDeleteLobby() {
        if (!multiplayer || !gameId || !playerName) return;

        try {
            setErrorMessage('');
            await deleteLobby(gameId, playerName);
            localStorage.removeItem(MULTIPLAYER_SESSION_KEY);
            navigate('/play');
        } catch (error) {
            setErrorMessage(`Cannot delete lobby: ${error.message}`);
        }
    }

    // ============ Render ============

    return (
        <div className="game-page">
            <h1>Quick, Draw!</h1>

            {errorMessage && (
                <div className="error-message">
                    <p>{errorMessage}</p>
                </div>
            )}

            {/* Multiplayer Ready-Up Interface */}
            {multiplayer && gameState && !gameReady && (
                <ReadyUpUI
                    gameState={gameState}
                    gameId={gameId}
                    playerName={playerName}
                    onMarkReady={handleMarkReady}
                    onMarkNotReady={handleMarkNotReady}
                    onStartGame={handleStartGame}
                    onLeaveLobby={handleLeaveLobby}
                    onDeleteLobby={handleDeleteLobby}
                />
            )}

            {/* Start Game Button */}
            <div className="button-group">
                <button
                    className="btn-start-game"
                    onClick={gameLogic.startNewGame}
                    disabled={multiplayer && !gameReady}
                >
                    Start Game
                </button>
            </div>

            {/* Category Display */}
            <div className="category-display">
                {gameLogic.hasStartedGame && gameLogic.targetCategory ? (
                    <h2>
                        {'->'} <strong>{gameLogic.targetCategory}</strong> {'<-'}
                    </h2>
                ) : multiplayer && !gameReady ? (
                    <p>Waiting for the game to start...</p>
                ) : (
                    <p>Click on "Commencer la partie" to start</p>
                )}
            </div>


            {/* Drawing Tools */}
            <div className="GameTools">
                <GameTools
                    brushState={drawingControl.brushState}
                    brushSize={drawingControl.brushSize}
                    onBrushStateChange={drawingControl.setBrushState}
                    onBrushSizeChange={drawingControl.setBrushSize}
                    onClear={drawingControl.clearCanvas}
                />
                {/* Timer */}
                <div className="timer-display">
                    {gameLogic.hasStartedGame
                        ? `00:${
                              gameLogic.timeLeft < 10
                                  ? `0${gameLogic.timeLeft}`
                                  : gameLogic.timeLeft
                          }`
                        : '--:--'}
                </div>
            </div>

            < div className = "CanvasContainer">
                {/* Main Canvas */}
                <canvas className="mainCanvas"
                    ref={canvasRef}
                    width={MAIN_CANVAS_WIDTH}
                    height={MAIN_CANVAS_HEIGHT}
                    style={{ border: '1px solid black', backgroundColor: 'white' }}
                    onClick={drawingControl.onClickCanvas}
                    onMouseDown={drawingControl.onMouseDownCanvas}
                    onMouseMove={drawingControl.handleMouseMoveCanvas}
                    onMouseUp={drawingControl.handleMouseUpCanvas}
                />

                {/* Opponent Canvas (Multiplayer) */}
                {multiplayer && (
                    <canvas className = "opponentCanvas"
                        ref={canvasRefOpponent}
                        width={OPPONENT_CANVAS_WIDTH}
                        height={OPPONENT_CANVAS_HEIGHT}
                        style={{
                            border: '1px solid black',
                            backgroundColor: 'white',
                            pointerEvents: 'none'
                        }}
                    />
                )}
            </div>

            {/* Prediction Display */}
            <PredictionDisplay predictionData={gameLogic.predictionData} />
        </div>
    );
}
