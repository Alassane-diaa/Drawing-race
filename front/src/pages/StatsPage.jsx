import { useAuth } from '../hooks/useAuth';
import { useEffect, useState } from 'react';
import { userService } from '../services/userService';

export default function StatsPage() {
    const { token, isUser, isLoading } = useAuth();
    const [stats, setStats] = useState(null);
    const [error, setError] = useState(null);
    const [rainbowActive, setRainbowActive] = useState(false);

    useEffect(() => {
        if (!isUser) return;

        userService.getMyStats(token)
            .then(data => setStats(data))
            .catch(err => setError(err.message));
    }, [isUser, token]);

    if (isLoading)  return <p>Chargement...</p>;
    if (!isUser)    return <p>Connecte-toi pour voir tes stats.</p>;
    if (error)      return <p>Erreur : {error}</p>;
    if (!stats)     return <p>Chargement des stats...</p>;

    const canActivate = stats.wins > -1;

    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'row', 
            alignItems: 'center', 
            gap: '2rem',  
            flexWrap: 'wrap', 
            justifyContent: 'space-evenly',
        
        }}>
            
            <div style={{ 
                order: 1, 
                display: 'flex', 
                flexDirection: 'column',
                flex: 1,
                maxHeight: '400px', 
                width: '600px', 
                backgroundColor: '#fff', 
                borderRadius: '8px', 
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                paddingRight: '4rem'
            }}>
                <h3 style={{ marginTop: 0, marginBottom: '1rem', textAlign: 'center' }}>Le Leaderboard</h3>
                
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
                    <span style={{ textAlign: 'right' }}>Number of wins</span>
                </div>

                {/* Zone Scrollable */}
                <div style={{ 
                    overflowY: 'auto', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '0.75rem', 
                    paddingRight: '0.5rem' 
                }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 60px', alignItems: 'center' }}>
                        <span style={{ color: '#ffb703', fontWeight: 'bold' }}>1</span>
                        <span>Alice</span>
                        <span style={{ textAlign: 'right', fontWeight: '500' }}>2450</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 60px', alignItems: 'center' }}>
                        <span style={{ color: '#888', fontWeight: 'bold' }}>2</span>
                        <span>Bob</span>
                        <span style={{ textAlign: 'right', fontWeight: '500' }}>1890</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 60px', alignItems: 'center' }}>
                        <span style={{ color: '#cd7f32', fontWeight: 'bold' }}>3</span>
                        <span>Charlie</span>
                        <span style={{ textAlign: 'right', fontWeight: '500' }}>1650</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 60px', alignItems: 'center' }}>
                        <span style={{ color: '#cd7f32', fontWeight: 'bold' }}>3</span>
                        <span>Charlie</span>
                        <span style={{ textAlign: 'right', fontWeight: '500' }}>1650</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 60px', alignItems: 'center' }}>
                        <span style={{ color: '#cd7f32', fontWeight: 'bold' }}>3</span>
                        <span>Charlie</span>
                        <span style={{ textAlign: 'right', fontWeight: '500' }}>1650</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 60px', alignItems: 'center' }}>
                        <span style={{ color: '#cd7f32', fontWeight: 'bold' }}>3</span>
                        <span>Charlie</span>
                        <span style={{ textAlign: 'right', fontWeight: '500' }}>1650</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 60px', alignItems: 'center' }}>
                        <span style={{ color: '#cd7f32', fontWeight: 'bold' }}>3</span>
                        <span>Charlie</span>
                        <span style={{ textAlign: 'right', fontWeight: '500' }}>1650</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 60px', alignItems: 'center' }}>
                        <span style={{ color: '#cd7f32', fontWeight: 'bold' }}>3</span>
                        <span>Charlie</span>
                        <span style={{ textAlign: 'right', fontWeight: '500' }}>1650</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 60px', alignItems: 'center' }}>
                        <span style={{ color: '#cd7f32', fontWeight: 'bold' }}>3</span>
                        <span>Charlie</span>
                        <span style={{ textAlign: 'right', fontWeight: '500' }}>1650</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 60px', alignItems: 'center' }}>
                        <span style={{ color: '#cd7f32', fontWeight: 'bold' }}>3</span>
                        <span>Charlie</span>
                        <span style={{ textAlign: 'right', fontWeight: '500' }}>1650</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 60px', alignItems: 'center' }}>
                        <span style={{ color: '#cd7f32', fontWeight: 'bold' }}>3</span>
                        <span>Charlie</span>
                        <span style={{ textAlign: 'right', fontWeight: '500' }}>1650</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 60px', alignItems: 'center' }}>
                        <span style={{ color: '#cd7f32', fontWeight: 'bold' }}>3</span>
                        <span>Charlie</span>
                        <span style={{ textAlign: 'right', fontWeight: '500' }}>1650</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 60px', alignItems: 'center' }}>
                        <span style={{ color: '#cd7f32', fontWeight: 'bold' }}>3</span>
                        <span>Charlie</span>
                        <span style={{ textAlign: 'right', fontWeight: '500' }}>1650</span>
                    </div>

                </div>
            </div>

            <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: '2rem', 
                padding: '2rem', 
                order: 2, 
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

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
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
                            
            <div style={{ 
                order: 3,
                justifyContent: 'flex-end',
                flex: 1,
                paddingLeft: '4rem'
             }}>
                <p>Badges</p>
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