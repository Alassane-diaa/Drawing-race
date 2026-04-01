/**
 * LobbyGameCard Component
 * Displays game information in the lobby
 */

export default function LobbyGameCard({ game, playerName, onMarkReady, onStartGame }) {
    if (!game) {
        return null;
    }

    const isPlayer1 = playerName === game.player1Name;
    const isPlayer2 = playerName === game.player2Name;
    const bothPlayersReady = game.player1Ready && game.player2Ready && game.player2Name;
    const canPlayer2Ready = game.status === 'IN_PROGRESS' && isPlayer2;
    const canHostStart = game.status === 'IN_PROGRESS' && isPlayer1 && bothPlayersReady;

    return (
        <div className="lobby-game-card">
            <div className="game-header">
                <h3>Game: {game.gameId}</h3>
                <span className={`status-badge ${game.status.toLowerCase()}`}>
                    {game.status}
                </span>
            </div>

            {game.status === 'WAITING' && (
                <div className="game-players">
                    <div className="player">
                        <span className="player-label">Player 1:</span>
                        <span className="player-name">{game.player1Name}</span>
                        <span className={`ready-status ${game.player1Ready ? 'ready' : 'not-ready'}`}>
                            {game.player1Ready ? 'Ready' : 'Waiting'}
                        </span>
                        {isPlayer1 && <span className="you-badge">(You)</span>}
                    </div>

                    <div className="player">
                        <span className="player-label">Player 2:</span>
                        <span className="player-name">
                            {game.player2Name || 'Waiting for player...'}
                        </span>
                        {game.player2Name && (
                            <span className={`ready-status ${game.player2Ready ? 'ready' : 'not-ready'}`}>
                                {game.player2Ready ? 'Ready' : 'Not ready'}
                            </span>
                        )}
                        {isPlayer2 && <span className="you-badge">(You)</span>}
                    </div>
                </div>
            )}

            {onMarkReady && (
                <div className="game-actions">
                    {isPlayer2 && (
                        <button
                            onClick={onMarkReady}
                            className="btn-ready"
                            disabled={!canPlayer2Ready}
                        >
                            {game.player2Ready ? 'Ready' : 'Mark as Ready'}
                        </button>
                    )}
                    {isPlayer1 && (
                        <button
                            onClick={onStartGame}
                            className="btn-start"
                            disabled={!onStartGame || !canHostStart}
                        >
                            Start Game
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
