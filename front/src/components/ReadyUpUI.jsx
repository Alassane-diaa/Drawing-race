/**
 * ReadyUpUI Component
 * Displays the ready-up interface for multiplayer games
 */

export default function ReadyUpUI({ gameState, gameId, playerName, onMarkReady, onMarkNotReady, onStartGame, onLeaveLobby, onDeleteLobby }) {
    if (!gameState || !['WAITING', 'IN_PROGRESS'].includes(gameState.status)) {
        return null;
    }

    const isPlayer1 = playerName === gameState.player1Name;
    const isPlayer2 = playerName === gameState.player2Name;
    const player1Ready = gameState.player1Ready;
    const player2Ready = gameState.player2Ready;
    const bothPlayersReady = player1Ready && player2Ready && gameState.player2Name;
    const displayedGameId = gameState.gameId || gameId;
    const canPlayer2ToggleReady = isPlayer2 && gameState.status === 'IN_PROGRESS';
    const canHostStart = isPlayer1 && bothPlayersReady && gameState.status === 'IN_PROGRESS';
    const canLeaveLobby = isPlayer2 && gameState.status === 'IN_PROGRESS';
    const canDeleteLobby = isPlayer1;
    const statusLabel = gameState.status === 'WAITING'
        ? 'WAITING'
        : gameState.status === 'IN_PROGRESS'
        ? 'READY UP'
        : gameState.status === 'STARTED'
        ? 'IN GAME'
        : gameState.status === 'FINISHED'
        ? 'FINISHED'
        : gameState.status;

    return (
        <div className="ready-up-container">
            <h3>Ready Room (Game #{displayedGameId} - {statusLabel})</h3>
            
            <div className="players-status">
                <div className="player-status">
                    <span>Player 1: {gameState.player1Name}</span>
                    <span className="status-indicator">
                        {player1Ready ? ' Ready' : ' Not ready'}
                    </span>
                    {isPlayer1 && <span className="you-indicator"> (You)</span>}
                </div>

                <div className="player-status">
                    <span>Player 2: {gameState.player2Name || 'Waiting for a second player...'}</span>
                    {gameState.player2Name && (
                        <span className="status-indicator">
                            {player2Ready ? ' Ready' : ' Not ready'}
                        </span>
                    )}
                    {isPlayer2 && <span className="you-indicator"> (You)</span>}
                </div>
            </div>

            <div className="ready-up-buttons">
                {isPlayer2 && (
                    <>
                        <button
                            onClick={player2Ready ? onMarkNotReady : onMarkReady}
                            className={player2Ready ? 'btn-unready' : 'btn-ready'}
                            disabled={!canPlayer2ToggleReady}
                        >
                            {player2Ready ? 'Mark not ready' : 'Mark as ready'}
                        </button>

                        <button
                            onClick={onLeaveLobby}
                            className="btn-unready"
                            disabled={!canLeaveLobby}
                        >
                            Leave lobby
                        </button>
                    </>
                )}

                {isPlayer1 && (
                    <>
                        <button
                            onClick={onStartGame}
                            className="btn-start-game"
                            disabled={!canHostStart}
                        >
                            Start game
                        </button>

                        <button
                            onClick={onDeleteLobby}
                            className="btn-unready"
                            disabled={!canDeleteLobby}
                        >
                            Delete lobby
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
