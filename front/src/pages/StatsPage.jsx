import { useAuth } from '../hooks/useAuth';
import { useEffect, useState } from 'react';
import { userService } from '../services/userService';

export default function StatsPage() {
    const { token, isUser, isLoading } = useAuth();
    const [stats, setStats] = useState(null);
    const [leaderboard, setLeaderboard] = useState(null);
    const [error, setError] = useState(null);
    const [rainbowActive, setRainbowActive] = useState(false);

    useEffect(() => {
        if (!isUser) return;

        userService.getMyStats(token)
            .then(data => setStats(data))
            .catch(err => setError(err.message));
        
        userService.getLeaderboard()
            .then(data => setLeaderboard(data))
            .catch(err => console.warn("Leaderboard:", err.message));

    }, [isUser, token]);

    if (isLoading)  return <p>Chargement...</p>;
    if (!isUser)    return <p>Connecte-toi pour voir tes stats.</p>;
    if (error)      return <p>Erreur : {error}</p>;
    if (!stats)     return <p>Chargement des stats...</p>;

    const canActivate = stats.wins > -1;

    // ... (imports et logique du composant identiques)

    return (
        <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr auto 1fr', /* LE SECRET EST ICI : 3 colonnes parfaites */
            gap: '4rem', /* Le gap conséquent entre les 3 éléments */
            alignItems: 'start', /* Aligne tout par le haut */
            padding: '2rem',
            width: '100%',
            boxSizing: 'border-box'
        }}>
            
            {/* === COLONNE 1 : LEADERBOARD === */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    maxHeight: '400px',
                    width: '300px', /* Fixe la largeur du leaderboard */
                    backgroundColor: '#fff', 
                    borderRadius: '8px', 
                    padding: '1rem',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    <h3 style={{ marginTop: 0, marginBottom: '1rem', textAlign: 'center' }}>Le Leaderboard</h3>
                    
                    {/* En-tête des colonnes (Fixe) */}
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '40px 1fr 60px', 
                        fontWeight: 'bold', 
                        borderBottom: '2px solid #eee', 
                        paddingBottom: '0.5rem', 
                        marginBottom: '0.5rem' 
                    }}>
                        <span>#</span>
                        <span>Joueur</span>
                        <span style={{ textAlign: 'right' }}>Score</span>
                    </div>

                    {/* Zone Scrollable */}
                    <div style={{ 
                        overflowY: 'auto', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '0.75rem', 
                        paddingRight: '0.5rem' 
                    }}>
                                        {leaderboard === null ? (
                        <p>Chargement...</p>
                    ) : (
                        leaderboard.map((player, index) => (
                            <div key={player.id} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 60px', alignItems: 'center' }}>
                                <span style={{ 
                                    fontWeight: 'bold',
                                    color: index === 0 ? '#ffb703' : index === 1 ? '#888' : index === 2 ? '#cd7f32' : '#000'
                                }}>
                                    {index + 1}
                                </span>
                                <span>{player.username}</span>
                                <span style={{ textAlign: 'right', fontWeight: 500 }}>{player.wins}</span>
                            </div>
                        ))
                    )}
                    </div>
                </div>
            </div>

            {/* === COLONNE 2 : STATS ET PROFIL (Le Vrai Centre) === */}
            <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: '2rem'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ position: 'relative', width: 108, height: 108, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        
                        {!rainbowActive && (
                            <div style={{
                                position: 'absolute', inset: -4,
                                borderRadius: '50%',
                                border: '3px solid rgba(0,0,0,0.15)',
                            }} />
                        )}

                        {rainbowActive && (
                            <>
                                <div style={{
                                    position: 'absolute', inset: -4,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(90deg, #ff0080, #ff8c00, #ffe100, #00ff80, #00cfff, #a020f0, #ff0080)',
                                    backgroundSize: '200% 200%',
                                    animation: 'rainbowSpin 2s linear infinite',
                                }} />
                                <div style={{
                                    position: 'absolute', inset: 3,
                                    borderRadius: '50%',
                                    background: 'white',
                                }} />
                            </>
                        )}

                        <img
                            src={stats.avatarFilename
                                ? `http://localhost:8080/user/avatar/${stats.avatarFilename}`
                                : '/default-avatar.png'}
                            alt="Photo de profil"
                            style={{
                                position: 'relative', zIndex: 2,
                                width: 100, height: 100,
                                borderRadius: '50%',
                                objectFit: 'cover',
                            }}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <StatCard label="Parties"   value={stats.gamesPlayed} />
                    <StatCard label="Victoires" value={stats.wins} />
                    <StatCard label="Précision" value={`${stats.accuracy}%`} />
                </div>

                <button
                    onClick={() => setRainbowActive(v => !v)}
                    disabled={!canActivate}
                    style={{ opacity: canActivate ? 1 : 0.4, cursor: canActivate ? 'pointer' : 'not-allowed' }}
                >
                    {rainbowActive ? '✦ Désactiver le liseré' : '✦ Activer le liseré champion'}
                </button>
            </div>
                            
            {/* === COLONNE 3 : BADGES === */}
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <p style={{ marginTop: 0 }}>Badges</p>
            </div>                

        </div>
    );
}


function StatCard({ label, value }) {
    return (
        <div style={{ background: '#f5f5f5', borderRadius: 8, padding: '1rem', textAlign: 'center' }}>
            <p style={{ margin: '0 0 4px', fontSize: 12, color: '#888' }}>{label}</p>
            <p style={{ margin: 0, fontSize: 24, fontWeight: 500 }}>{value}</p>
        </div>
    );
}