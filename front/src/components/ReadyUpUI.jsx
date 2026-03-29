/**
 * ReadyUpUI Component
 * Displays the ready-up interface for multiplayer games
 */

export default function ReadyUpUI({ gameState, playerName, onMarkReady, onMarkNotReady, onStartGame }) {
    if (!gameState || !['WAITING', 'IN_PROGRESS'].includes(gameState.status)) {
        return null;
    }

    const isPlayer1 = playerName === gameState.player1Name;
    const isPlayer2 = playerName === gameState.player2Name;
    const player1Ready = gameState.player1Ready;
    const player2Ready = gameState.player2Ready;
    const bothPlayersReady = player1Ready && player2Ready && gameState.player2Name;

    return (
        <div className="ready-up-container">
            <h3>Ready Up! (Game: {gameState.status})</h3>
            
            <div className="players-status">
                <div className="player-status">
                    <span>Player 1: {gameState.player1Name}</span>
                    <span className="status-indicator">
                        {player1Ready ? ' Ready' : ' Not Ready'}
                    </span>
                    {isPlayer1 && <span className="you-indicator"> (You)</span>}
                </div>

                <div className="player-status">
                    <span>Player 2: {gameState.player2Name || 'Waiting for join...'}</span>
                    {gameState.player2Name && (
                        <span className="status-indicator">
                            {player2Ready ? ' Ready' : ' Not Ready'}
                        </span>
                    )}
                    {isPlayer2 && <span className="you-indicator"> (You)</span>}
                </div>
            </div>

            <div className="ready-up-buttons">
                {isPlayer2 && (
                    <>
                        {player2Ready ? (
                            <button onClick={onMarkNotReady} className="btn-unready">
                                Mark as Not Ready
                            </button>
                        ) : (
                            <button onClick={onMarkReady} className="btn-ready">
                                Mark as Ready
                            </button>
                        )}
                    </>
                )}

                {isPlayer1 && bothPlayersReady && (
                    <button onClick={onStartGame} className="btn-start-game">
                        Start Game
                    </button>
                )}
            </div>
        </div>
    );
}
