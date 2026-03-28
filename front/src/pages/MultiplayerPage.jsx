import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Services
import {
    createGame,
    joinGame,
    joinRandomGame,
    markPlayerReady
} from '../services/gameService';

// Hooks
import { useLobbyWebsocket } from '../hooks/useGameWebsocket';

// Components
import LobbyGameCard from '../components/LobbyGameCard';

const MULTIPLAYER_SESSION_KEY = 'multiplayerSession';

export default function MultiplayerPage() {
    const { user, isUser } = useAuth();
    const navigate = useNavigate();

    const [game, setGame] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [gameIdInput, setGameIdInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Update welcome message when user changes
    useEffect(() => {
        if (!isUser) {
            setMessage('Please login first');
        } else {
            setMessage(`Welcome, ${user.username}!`);
        }
    }, [isUser, user]);

    // WebSocket for lobby updates
    useLobbyWebsocket({
        gameId: game?.gameId,
        playerName: user?.username,
        enabled: !!game && isUser,
        onStateChanged: handleGameStateChanged,
        onEvent: handleGameEvent,
        onError: (errorMsg) => setError(errorMsg)
    });

    // ============ Event Handlers ============

    function handleGameStateChanged(gameState) {
        setGame(gameState);

        // Auto-redirect when game starts
        if (gameState.status === 'STARTED') {
            redirectToGame(gameState);
        }
    }

    function handleGameEvent(gameEvent) {
        if (gameEvent.type === 'PLAYER2_JOINED') {
            const updatedGame = {
                ...game,
                player2Name: gameEvent.joinedPlayerName
            };
            setGame(updatedGame);
            // Player 1 (host) redirects immediately when Player 2 joins
            if (user?.username === game.player1Name) {
                redirectToGame(updatedGame);
            }
        }

        if (gameEvent.type === 'PLAYER_READY') {
            setGame(prev => ({
                ...prev,
                player1Ready: gameEvent.joinedPlayerName === prev.player1Name ? true : prev.player1Ready,
                player2Ready: gameEvent.joinedPlayerName === prev.player2Name ? true : prev.player2Ready,
            }));
        }

        if (gameEvent.type === 'GAME_STARTED') {
            // Ensure we have the latest game state for redirect
            handleGameStateChanged(game);
        }
    }

    // ============ Game Actions ============

    async function handleCreateGame() {
        if (!isUser) {
            setError('Please login first');
            return;
        }

        try {
            setError('');
            setIsLoading(true);
            const createdGame = await createGame(user.username);
            setGame(createdGame);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleJoinGame() {
        if (!isUser) {
            setError('Please login first');
            return;
        }

        if (!gameIdInput.trim()) {
            setError('Please enter a game ID');
            return;
        }

        try {
            setError('');
            setIsLoading(true);
            const joinedGame = await joinGame(gameIdInput, user.username);
            setGame(joinedGame);

            if (joinedGame.status === 'IN_PROGRESS') {
                redirectToGame(joinedGame);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleJoinRandomGame() {
        if (!isUser) {
            setError('Please login first');
            return;
        }

        try {
            setError('');
            setIsLoading(true);
            const joinedGame = await joinRandomGame(user.username);
            setGame(joinedGame);

            if (joinedGame.status === 'IN_PROGRESS') {
                redirectToGame(joinedGame);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleMarkReady() {
        if (!game) return;

        try {
            setError('');
            const updatedGame = await markPlayerReady(game.gameId, user.username);
            setGame(updatedGame);
        } catch (err) {
            setError(err.message);
        }
    }

    // ============ Navigation ============

    function redirectToGame(currentGame) {
        try {
            localStorage.setItem(MULTIPLAYER_SESSION_KEY, JSON.stringify({
                gameId: currentGame.gameId,
                playerName: user.username,
                multiplayer: true,
            }));
        } catch (error) {
            console.warn('Unable to persist multiplayer session:', error);
        }

        navigate('/game', {
            state: {
                gameId: currentGame.gameId,
                playerName: user.username,
                multiplayer: true,
                gameState: currentGame,
            },
        });
    }

    // ============ Render ============

    return (
        <div className="multiplayer-page">
            <div className="welcome-section">
                <p className="message">{message}</p>
            </div>

            {/* Game Actions */}
            <div className="game-actions-section">
                <h2>Join or Create a Game</h2>
                
                <div className="action-buttons">
                    <button
                        onClick={handleCreateGame}
                        disabled={!isUser || isLoading}
                        className="btn-create"
                    >
                        {isLoading ? 'Creating...' : 'Create Game'}
                    </button>

                    <button
                        onClick={handleJoinRandomGame}
                        disabled={!isUser || isLoading}
                        className="btn-join-random"
                    >
                        {isLoading ? 'Joining...' : 'Join Random Game'}
                    </button>
                </div>

                <div className="join-specific-game">
                    <input
                        type="text"
                        placeholder="Enter Game ID"
                        value={gameIdInput}
                        onChange={(e) => setGameIdInput(e.target.value)}
                        disabled={isLoading}
                        className="game-id-input"
                    />
                    <button
                        onClick={handleJoinGame}
                        disabled={!isUser || !gameIdInput.trim() || isLoading}
                        className="btn-join"
                    >
                        {isLoading ? 'Joining...' : 'Join Game'}
                    </button>
                </div>
            </div>

            {/* Game Card */}
            {game && (
                <LobbyGameCard
                    game={game}
                    playerName={user.username}
                    onMarkReady={handleMarkReady}
                    onStartGame={() => {}}
                />
            )}

            {/* Error Display */}
            {error && (
                <div className="error-message">
                    <p>{error}</p>
                </div>
            )}
        </div>
    );
}
