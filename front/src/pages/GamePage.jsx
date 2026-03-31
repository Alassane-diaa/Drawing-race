import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './GamePage.css';

// Services
import {
    getGameState,
    processDrawing,
    markPlayerReady,
    markPlayerNotReady,
    startGame as startMultiplayerGame,
    leaveLobby,
    deleteLobby,
    submitPrediction,
    finishRound,
    restartGame,
    stopGame
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
//const MAIN_CANVAS_WIDTH = 800;
//const MAIN_CANVAS_HEIGHT = 600;
//const OPPONENT_CANVAS_WIDTH = 400;
//const OPPONENT_CANVAS_HEIGHT = 300;
const MULTIPLAYER_SESSION_KEY = 'multiplayerSession';

export default function GamePage() {
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const canvasRefOpponent = useRef(null);
    const opponentStrokesRef = useRef([]);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

    useEffect(() => {
        function redimensionner() {
        // On veut que le canvas fasse 40% de la largeur de la fenêtre
        // mais on garde une taille max ET un ratio pour ne pas tout casser
        const nouvelleLargeur = Math.min(window.innerWidth * 0.4, 800);
        const nouvelleHauteur = (nouvelleLargeur * 3) / 4;

        setDimensions({
            width: nouvelleLargeur,
            height: nouvelleHauteur
        });
        }

    // On appelle quand il faut j'espère
    window.addEventListener('resize', redimensionner);
    redimensionner();

    return () => window.removeEventListener('resize', redimensionner);
    }, []);

    // Location state
    const location = useLocation();
    const isMultiplayerRoute = location.pathname.startsWith('/multiplayer/');
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
    const multiplayer = isMultiplayerRoute
        ? Boolean(location.state?.multiplayer ?? storedSession?.multiplayer)
        : false;
    const gameId = multiplayer ? (location.state?.gameId || storedSession?.gameId) : undefined;
    const playerName = multiplayer ? (location.state?.playerName || storedSession?.playerName) : undefined;
    const selectedDifficulty = location.state?.difficulty || 'medium';
    const initialGameState = location.state?.gameState;

    // Local state
    const [gameReady, setGameReady] = useState(!multiplayer || initialGameState?.status === 'STARTED');
    const [gameState, setGameState] = useState(initialGameState);
    const [multiplayerPredictionData, setMultiplayerPredictionData] = useState(null);
    const [multiplayerTimeLeft, setMultiplayerTimeLeft] = useState(0);
    const [infoMessage, setInfoMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const announcedRoundRef = useRef(0);
    const timeoutHandledRoundRef = useRef('');
    const clearedRoundRef = useRef('');
    const isHost = multiplayer && playerName && gameState?.player1Name === playerName;
    const isPlayer2 = multiplayer && playerName && gameState?.player2Name === playerName;

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

    useEffect(() => {
        if (!multiplayer || !gameId) {
            return;
        }

        let isCancelled = false;

        const syncState = async () => {
            try {
                const latestState = await getGameState(gameId);
                if (!isCancelled) {
                    setGameState(latestState);
                }
            } catch {
                // Keep WebSocket state as source if polling temporarily fails.
            }
        };

        const interval = setInterval(syncState, 1500);
        return () => {
            isCancelled = true;
            clearInterval(interval);
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
        if (state.status === 'STARTED' || state.status === 'FINISHED') {
            setGameReady(true);
        } else {
            setGameReady(false);
        }
    }

    async function handleStrokeComplete(finishedStroke, updatedCoords) {
        const activeClient = stompClientRef.current;

        // Publish to multiplayer
        if (multiplayer && gameId && playerName && activeClient?.connected) {
            publishStroke(activeClient, gameId, playerName, finishedStroke);
        }

        if (multiplayer && gameId && playerName && gameState?.status === 'STARTED' && gameState?.roundActive) {
            try {
                const predictionResponse = await processDrawing(updatedCoords);
                setMultiplayerPredictionData(predictionResponse);

                const predictionCategory = predictionResponse?.prediction?.category || '';
                const predictionConfidence = predictionResponse?.prediction?.confidence || 0;
                const targetCategory = gameState?.targetCategory;
                const targetInTop10 = predictionResponse?.top10?.find(
                    (item) => item?.category === targetCategory
                );
                const targetConfidence = targetInTop10?.confidence
                    || (predictionCategory === targetCategory ? predictionConfidence : 0);

                await submitPrediction(
                    gameId,
                    playerName,
                    predictionCategory,
                    predictionConfidence,
                    targetConfidence
                );
            } catch (error) {
                setErrorMessage(`Prediction sync failed: ${error.message}`);
            }
            return;
        }

        // Solo mode AI prediction
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
        setInfoMessage(`Temps écoulé. Catégorie attendue: ${category}`);
        gameLogic.resetGame();
    }

    function handleVictory(category, confidence) {
        setInfoMessage(`Bravo. L'IA a reconnu: ${category} (${(confidence * 100).toFixed(2)}%)`);
        gameLogic.resetGame();
    }

    useEffect(() => {
        if (!multiplayer || !gameState) {
            return;
        }

        if (gameState.lastRoundNumber > 0 && gameState.lastRoundNumber !== announcedRoundRef.current) {
            announcedRoundRef.current = gameState.lastRoundNumber;
            if (gameState.lastRoundResult === 'TIE') {
                setInfoMessage(`Manche ${gameState.lastRoundNumber}: égalité.`);
            } else if (gameState.lastRoundWinnerName) {
                setInfoMessage(`Manche ${gameState.lastRoundNumber}: ${gameState.lastRoundWinnerName} gagne.`);
            }
        }

        if (gameState.status === 'FINISHED') {
            if (gameState.matchWinnerName) {
                setInfoMessage(`Partie terminée: ${gameState.matchWinnerName} remporte le match.`);
            } else {
                setInfoMessage('Partie terminée: match nul.');
            }
        }
    }, [multiplayer, gameState]);

    useEffect(() => {
        if (!multiplayer || !gameState || gameState.status !== 'STARTED' || !gameState.roundActive) {
            setMultiplayerTimeLeft(0);
            return;
        }

        const roundKey = `${gameState.gameId}-${gameState.currentRound}-${gameState.roundStartedAtMs}`;
        timeoutHandledRoundRef.current = '';

        const updateRemainingTime = async () => {
            const endAtMs = gameState.roundStartedAtMs + gameState.roundDurationSec * 1000;
            const seconds = Math.max(0, Math.ceil((endAtMs - Date.now()) / 1000));
            setMultiplayerTimeLeft(seconds);

            if (seconds === 0 && timeoutHandledRoundRef.current !== roundKey) {
                timeoutHandledRoundRef.current = roundKey;
                try {
                    await finishRound(gameId, playerName);
                } catch (error) {
                    setErrorMessage(`Round sync failed: ${error.message}`);
                }
            }
        };

        updateRemainingTime();
        const interval = setInterval(updateRemainingTime, 250);
        return () => clearInterval(interval);
    }, [
        multiplayer,
        gameState,
        gameId,
        playerName
    ]);

    useEffect(() => {
        if (!multiplayer || !gameState || gameState.status !== 'STARTED' || !gameState.roundActive) {
            return;
        }

        const roundKey = `${gameState.gameId}-${gameState.currentRound}-${gameState.roundStartedAtMs}`;
        if (clearedRoundRef.current === roundKey) {
            return;
        }

        clearedRoundRef.current = roundKey;

        // Reset both canvases and local prediction display at the beginning of each round.
        drawingControl.hardResetCanvas();
        setMultiplayerPredictionData(null);

        opponentStrokesRef.current = [];
        drawCenteredOnCanvas(canvasRefOpponent.current, []);
    }, [multiplayer, gameState, drawingControl]);

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

    async function handleRestartGame() {
        if (!multiplayer || !gameId || !playerName) return;

        try {
            setErrorMessage('');
            const updatedGame = await restartGame(gameId, playerName);
            setGameState(updatedGame);
            setGameReady(false);
            setInfoMessage('Match relancé. Le host peut démarrer immédiatement.');
            drawingControl.hardResetCanvas();
            opponentStrokesRef.current = [];
            drawCenteredOnCanvas(canvasRefOpponent.current, []);
        } catch (error) {
            setErrorMessage(`Cannot restart game: ${error.message}`);
        }
    }

    async function handleStopGame() {
        if (!multiplayer || !gameId || !playerName) return;

        try {
            setErrorMessage('');
            const updatedGame = await stopGame(gameId, playerName);
            setGameState(updatedGame);
            setGameReady(false);
            setInfoMessage('Partie arrêtée. Retour au lobby.');
            drawingControl.hardResetCanvas();
            opponentStrokesRef.current = [];
            drawCenteredOnCanvas(canvasRefOpponent.current, []);
            setMultiplayerPredictionData(null);
        } catch (error) {
            setErrorMessage(`Cannot stop game: ${error.message}`);
        }
    }

    async function handleQuitCurrentMatch() {
        if (!multiplayer || !gameId || !playerName) return;

        try {
            setErrorMessage('');
            if (isHost) {
                await deleteLobby(gameId, playerName);
            } else if (isPlayer2) {
                await leaveLobby(gameId, playerName);
            }
        } catch (error) {
            setErrorMessage(`Cannot quit match cleanly: ${error.message}`);
        } finally {
            localStorage.removeItem(MULTIPLAYER_SESSION_KEY);
            navigate('/play');
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

            {infoMessage && (
                <div className="info-message">
                    <p>{infoMessage}</p>
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

            {/* Start Game Button (solo only) */}
            {!multiplayer && (
                <div className="button-group">
                    <button
                        className="btn-start-game"
                        onClick={gameLogic.startNewGame}
                        disabled={gameLogic.hasStartedGame}
                    >
                        Start Solo Game
                    </button>
                </div>
            )}

            {multiplayer && gameState?.status !== 'IN_PROGRESS' && (
                <div className="button-group">
                    {isHost && (
                        <button
                            className="btn-unready"
                            onClick={handleStopGame}
                            disabled={!gameId}
                        >
                            Stop Game
                        </button>
                    )}

                    {isHost && gameState?.status === 'FINISHED' && (
                        <button
                            className="btn-start-game"
                            onClick={handleRestartGame}
                            disabled={!gameId}
                        >
                            Relancer
                        </button>
                    )}

                    <button
                        className="btn-unready"
                        onClick={handleQuitCurrentMatch}
                        disabled={!gameId}
                    >
                        Quit Match
                    </button>
                </div>
            )}

            {multiplayer && gameState && (
                <div className="multiplayer-status-panel">
                    <p>Manche {gameState.currentRound}/{gameState.totalRounds}</p>
                    <p>{gameState.player1Name}: {gameState.player1RoundsWon} | {gameState.player2Name || 'Player 2'}: {gameState.player2RoundsWon}</p>
                    {gameState.status === 'STARTED' && gameState.roundActive && (
                        <p>Progres manche: {(gameState.player1BestConfidence * 100).toFixed(1)}% | {(gameState.player2BestConfidence * 100).toFixed(1)}%</p>
                    )}
                </div>
            )}

            {/* Category Display */}
            <div className="category-display">
                {!multiplayer && gameLogic.hasStartedGame && gameLogic.targetCategory ? (
                    <h2>
                        {'->'} <strong>{gameLogic.targetCategory}</strong> {'<-'}
                    </h2>
                ) : multiplayer && !gameReady ? (
                    <p>En attente du depart...</p>
                ) : multiplayer && gameState?.status === 'STARTED' && gameState?.targetCategory ? (
                    <h2>
                        {'->'} <strong>{gameState.targetCategory}</strong> {'<-'}
                    </h2>
                ) : multiplayer && gameState?.status === 'FINISHED' ? (
                    <p>Partie terminee.</p>
                ) : (
                    <p>Commence une partie.</p>
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
                    {multiplayer
                        ? `00:${multiplayerTimeLeft < 10 ? `0${multiplayerTimeLeft}` : multiplayerTimeLeft}`
                        : gameLogic.hasStartedGame
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
                    width={dimensions.width}
                    height={dimensions.height}
                    style={{
                        width: `${dimensions.width}px`,
                        height: `${dimensions.height}px`,
                        border: '1px solid black',
                        backgroundColor: 'white'
                    }}
                    onClick={drawingControl.onClickCanvas}
                    onMouseDown={drawingControl.onMouseDownCanvas}
                    onMouseMove={drawingControl.handleMouseMoveCanvas}
                    onMouseUp={drawingControl.handleMouseUpCanvas}
                />

                {/* Opponent Canvas (Multiplayer) */}
                {multiplayer && (
                    <canvas className = "opponentCanvas"
                        ref={canvasRefOpponent}
                        width={dimensions.width/2}
                        height={dimensions.height/2}
                        style={{
                            width: `${dimensions.width/2}px`,
                            height: `${dimensions.height/2}px`,
                            border: '1px solid black',
                            backgroundColor: 'white',
                            pointerEvents: 'none'
                        }}
                    />
                )}
            </div>

            {/* Prediction Display */}
            <PredictionDisplay predictionData={multiplayer ? multiplayerPredictionData : gameLogic.predictionData} />
        </div>
    );
}
