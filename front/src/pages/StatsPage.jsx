import { useAuth } from '../hooks/useAuth';
import { useEffect, useState } from 'react';

export default function StatsPage() {
    const { user, isUser, isLoading } = useAuth();
    const [rainbowActive, setRainbowActive] = useState(false);

    if (isLoading) return <p>Chargement...</p>;
    if (!isUser)   return <p>Connecte-toi pour voir tes stats.</p>;

    const canActivate = user.wins > 10;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', padding: '2rem' }}>

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
                        src={user.avatarUrl || '/default-avatar.png'}
                        alt="Photo de profil"
                        style={{
                            position: 'relative', zIndex: 2,
                            width: 100, height: 100,
                            borderRadius: '50%',
                            objectFit: 'cover',
                        }}
                    />
                </div>

                <p style={{ fontWeight: 500, fontSize: 20 }}>{user.username}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                <StatCard label="Parties"   value={user.gamesPlayed} />
                <StatCard label="Victoires" value={user.wins} />
                <StatCard label="Précision" value={`${user.accuracy}%`} />
            </div>

            <button
                onClick={() => setRainbowActive(v => !v)}
                disabled={!canActivate}
                style={{ opacity: canActivate ? 1 : 0.4, cursor: canActivate ? 'pointer' : 'not-allowed' }}
            >
                {rainbowActive ? '✦ Désactiver le liséré' : '✦ Activer le liséré champion'}
            </button>

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