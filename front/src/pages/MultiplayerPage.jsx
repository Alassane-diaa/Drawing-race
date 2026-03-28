import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
    import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useAuth } from '../hooks/useAuth';

const API_BASE_URL = 'http://localhost:8080';
const WS_BASE_URL = 'http://localhost:8080/ws';

const parseErrorResponse = async (response, fallbackMessage) => {
    try {
        const data = await response.json();
        return data.message || fallbackMessage;
    } catch {
        return fallbackMessage;
    }
};

const createGame = async (userName) => {
    const response = await fetch(`${API_BASE_URL}/game/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ playerName: userName })
    });

    if (!response.ok) {
        throw new Error(await parseErrorResponse(response, 'Unable to create game'));
    }

    return response.json();
};

const joinGame = async (gameId, userName) => {
    const response = await fetch(`${API_BASE_URL}/game/connect`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ gameId, playerName: userName })
    });

    if (!response.ok) {
        throw new Error(await parseErrorResponse(response, 'Unable to join game'));
    }

    return response.json();
};

const joinRandomGame = async (userName) => {
    const response = await fetch(`${API_BASE_URL}/game/connect/random`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ playerName: userName })
    });

    if (!response.ok) {
        throw new Error(await parseErrorResponse(response, 'Unable to join random game'));
    }

    return response.json();
};

export default function MultiplayerPage() {
    const { user, isUser } = useAuth();
    const navigate = useNavigate();
    const [game, setGame] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const refInput = useRef(null);
    const stompClientRef = useRef(null);

    useEffect(() => {
        if (!isUser) {
            setMessage('Login first');
        } else {
            setMessage('Welcome ' + user.username);
        }
    }, [isUser, user]);

    useEffect(() => {
        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
            }
        };
    }, []);

    const redirectToGame = (currentGame) => {
        navigate('/game', {
            state: {
                gameId: currentGame.gameId,
                playerName: user.username,
                multiplayer: true,
            },
        });
    };

    const connectLobbySocket = (currentGame) => {
        if (stompClientRef.current) {
            stompClientRef.current.deactivate();
        }

        const client = new Client({
            webSocketFactory: () => new SockJS(WS_BASE_URL),
            reconnectDelay: 5000,
        });

        client.onConnect = () => {
            client.subscribe(`/topic/game/${currentGame.gameId}/state`, (frame) => {
                const gameState = JSON.parse(frame.body);
                setGame(gameState);
                if (gameState.status === 'IN_PROGRESS') {
                    redirectToGame(gameState);
                }
            });

            client.subscribe(`/topic/game/${currentGame.gameId}/event`, (frame) => {
                const gameEvent = JSON.parse(frame.body);
                if (
                    gameEvent.type === 'PLAYER2_JOINED' &&
                    gameEvent.targetPlayerName === user.username
                ) {
                    redirectToGame({ ...currentGame, status: 'IN_PROGRESS' });
                }
            });
        };

        client.onStompError = (frame) => {
            setError(frame.headers.message || 'WebSocket error');
        };

        client.activate();
        stompClientRef.current = client;
    };

    const handleCreateGame = async () => {
        if (!isUser) {
            setError('Login first');
            return;
        }

        try {
            setError('');
            const createdGame = await createGame(user.username);
            setGame(createdGame);
            connectLobbySocket(createdGame);
        } catch (creationError) {
            setError(creationError.message);
        }
    };

    const handleJoinGame = async () => {
        if (!isUser) {
            setError('Login first');
            return;
        }

        const gameId = refInput.current?.value?.trim();
        if (!gameId) {
            setError('Please enter a game ID');
            return;
        }

        try {
            setError('');
            const joinedGame = await joinGame(gameId, user.username);
            setGame(joinedGame);
            connectLobbySocket(joinedGame);
            if (joinedGame.status === 'IN_PROGRESS') {
                redirectToGame(joinedGame);
            }
        } catch (joinError) {
            setError(joinError.message);
        }
    };

    const handleJoinRandomGame = async () => {
        if (!isUser) {
            setError('Login first');
            return;
        }

        try {
            setError('');
            const joinedGame = await joinRandomGame(user.username);
            setGame(joinedGame);
            connectLobbySocket(joinedGame);
            if (joinedGame.status === 'IN_PROGRESS') {
                redirectToGame(joinedGame);
            }
        } catch (joinError) {
            setError(joinError.message);
        }
    };

    useEffect(() => {
        if (game) {
            if (game.status === 'IN_PROGRESS') {
                redirectToGame(game);
            }
        }

    }, [game]);

    return (
        <>
        <div>{message}</div>
        <div>
            <button onClick={handleCreateGame}>Create Game</button>
            <input type="text" placeholder="Game ID" ref={refInput}/>
            <button onClick={handleJoinGame}>Join Game</button>
            <button onClick={handleJoinRandomGame}>Join Random</button>
        </div>
        {game && (
            <div>
                <div>Game ID: {game.gameId}</div>
                <div>Status: {game.status}</div>
            </div>
        )}
        {error && <div>{error}</div>}
        </>
    )
}
