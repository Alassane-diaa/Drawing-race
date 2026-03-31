import { useAuth } from '../hooks/useAuth';
import { useEffect, useState } from 'react';
import { userService } from '../services/userService';
import imageBadge from '../images/badgeDefaut.png';
import "./StatsPage.css";

// ─── Page principale ──────────────────────────────────────────────────────────
export default function StatsPage() {
    const { token, isUser, isLoading } = useAuth();
    const [stats, setStats]             = useState(null);
    const [leaderboard, setLeaderboard] = useState(null);
    const [error, setError]             = useState(null);
    const [rainbowActive, setRainbowActive] = useState(false);

    // Badges : liste globale + set des ids débloqués
    const [allBadges, setAllBadges]       = useState([]);
    const [unlockedIds, setUnlockedIds]   = useState(new Set());
    const [selectedBadgeId, setSelectedBadgeId] = useState(null);

    useEffect(() => {
        if (!isUser) return;

        // Stats joueur
        userService.getMyStats(token)
            .then(data => setStats(data))
            .catch(err => setError(err.message));

        // Leaderboard
        userService.getLeaderboard()
            .then(data => setLeaderboard(data))
            .catch(err => console.warn("Leaderboard:", err.message));

        // Liste globale des badges (sans auth)
        userService.getAllBadges()
            .then(data => setAllBadges(data))
            .catch(err => console.warn("Badges:", err.message));

        // Badges débloqués du joueur connecté
        userService.getMyBadges(token)
            .then(data => setUnlockedIds(new Set(data.map(b => b.id))))
            .catch(err => console.warn("Mes badges:", err.message));

    }, [isUser, token]);

    if (isLoading)   return <p>Chargement...</p>;
    if (!isUser)     return <p>Connecte-toi pour voir tes stats.</p>;
    if (error)       return <p>Erreur : {error}</p>;
    if (!stats)      return <p>Chargement des stats...</p>;

    const canActivate   = stats.wins > -1;
    const selectedBadge = allBadges.find(b => b.id === selectedBadgeId) ?? null;
    const selectedUnlocked = selectedBadgeId ? unlockedIds.has(selectedBadgeId) : false;

    return (
        <>
            {selectedBadge && (
                <BadgeModal
                    badge={selectedBadge}
                    unlocked={selectedUnlocked}
                    onClose={() => setSelectedBadgeId(null)}
                />
            )}

            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto 1fr',
                gap: '4rem',
                alignItems: 'start',
                padding: '2rem',
                width: '100%',
                boxSizing: 'border-box'
            }}>

                {/* ── Leaderboard ── */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        maxHeight: '400px',
                        width: '300px',
                        backgroundColor: '#fff',
                        borderRadius: '8px',
                        padding: '1rem',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
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
                            <span style={{ textAlign: 'right' }}>Score</span>
                        </div>

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

                {/* ── Centre : avatar + stats + bouton ── */}
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

                {/* ── Badges ── */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    flexDirection: 'column',
                    maxHeight: '400px',
                    width: '300px',
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    padding: '1rem',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    <h3 style={{ marginTop: 0 }}>Badges</h3>

                    {allBadges.length === 0 ? (
                        <p style={{ color: '#aaa', textAlign: 'center' }}>Chargement...</p>
                    ) : (
                        <div style={{
                            display: 'grid',
                            padding: '10px',
                            gap: '10px',
                            gridTemplateColumns: 'auto auto auto',
                            overflowY: 'auto',
                            overflowX: 'hidden',
                            boxSizing: 'border-box',
                            flex: 1
                        }}>
                            {allBadges.map(badge => (
                                <BadgeItem
                                    key={badge.id}
                                    badge={badge}
                                    unlocked={unlockedIds.has(badge.id)}
                                    onSelect={setSelectedBadgeId}
                                />
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </>
    );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({ label, value }) {
    return (
        <div style={{ background: '#f5f5f5', borderRadius: 8, padding: '1rem', textAlign: 'center' }}>
            <p style={{ margin: '0 0 4px', fontSize: 12, color: '#888' }}>{label}</p>
            <p style={{ margin: 0, fontSize: 24, fontWeight: 500 }}>{value}</p>
        </div>
    );
}

// ─── BadgeItem ────────────────────────────────────────────────────────────────
function BadgeItem({ badge, unlocked, onSelect }) {
    return (
        <div
            className={`badgeContainer ${unlocked ? 'badgeUnlocked' : 'badgeLocked'}`}
            style={{
                border: '4px dotted red',
                borderRadius: '30px',
                aspectRatio: '1',
                display: 'flex',
                minWidth: 0,
                position: 'relative',
            }}
        >
            <button
                className="buttonBadge"
                onClick={() => onSelect(badge.id)}
                aria-label={`Voir le badge ${badge.name}`}
            />
            <img
                src={imageBadge}
                alt={badge.name}
                className="imagebadge"
            />
            {!unlocked && (
                <div className="badgeLockOverlay">🔒</div>
            )}
        </div>
    );
}

// ─── BadgeModal ───────────────────────────────────────────────────────────────
function BadgeModal({ badge, unlocked, onClose }) {
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    return (
        <div className="modalOverlay" onClick={onClose}>
            <div
                className={`modalCard ${unlocked ? 'modalCardUnlocked' : 'modalCardLocked'}`}
                onClick={e => e.stopPropagation()}
            >
                <button className="modalCloseBtn" onClick={onClose} aria-label="Fermer">✕</button>

                <div className="modalIcon">
                    {unlocked
                        ? <img src={imageBadge} alt={badge.name} className="modalBadgeImg" />
                        : <span className="modalLockIcon">🔒</span>
                    }
                </div>

                <h2 className="modalBadgeName">{badge.name}</h2>

                <p className="modalBadgeDesc">
                    {unlocked ? badge.description : 'Ce badge n\'est pas encore débloqué. Continue à jouer !'}
                </p>

                {unlocked && (
                    <span className="modalUnlockedTag">✓ Débloqué</span>
                )}
            </div>
        </div>
    );
}