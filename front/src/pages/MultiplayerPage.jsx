import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../hooks/useAuth';

const createGame = async (userName, setGame) => {
    const response = await fetch('http://localhost:8080/game/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ "playerName": userName })
    });
    const game = await response.json();

    setGame(game);
};

const joinGame = async (gameId, userName, setGame) => {
    const response = await fetch('http://localhost:8080/game/connect', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ "gameId": gameId, "playerName": userName })
    });
    const game = await response.json();

    setGame(game);
};

export default function MultiplayerPage() {
    const { user, isUser } = useAuth();
    const navigate = useNavigate();
    const [game, setGame] = useState(null);
    const [message, setMessage] = useState('');
    const refInput = useRef(null);

    useEffect(() => {
        if (!isUser) {
            setMessage('Login first');
        } else {
            setMessage('Welcome ' + user.username);
        }
    }, [isUser, user]);

    useEffect(() => {
        if (game) {
            if (game.status === 'IN_PROGRESS') {
                navigate('/game');
            }
        }

    }, [game, navigate]);

    return (
        <>
        <div>{message}</div>
        <div>
            <button onClick={() => createGame(user.username, setGame)}>Create Game</button>
            <input type="text" placeholder="Game ID" ref={refInput}/>
            <button onClick={() => joinGame(refInput.current.value, user.username, setGame)}>Join Game</button>
        </div>
        {game && <div>Game ID: {game.gameId}</div>}
        </>
    )
}
