import { useAuth } from '../hooks/useAuth';
import { useEffect, useState } from 'react';
import './StatsPage.css';

// ─── Page principale ──────────────────────────────────────────────────────────
export default function StatsPage() {
    const { token, isUser, isLoading } = useAuth();
    const navigate = useNavigate();
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
        <div className="stats-page">
            <section className="stats-head">
                <h1>Stats</h1>
                <p>{message}</p>
            </section>

            <section className="stats-grid">
                <article>
                    <h3>Games</h3>
                    <div className="stat-value">-</div>
                </article>
                <article>
                    <h3>Winrate</h3>
                    <div className="stat-value">-</div>
                </article>
                <article>
                    <h3>Best score</h3>
                    <div className="stat-value">-</div>
                </article>
            </section>

            <section className="stats-note">
                Detailed statistics will appear here once backend data integration is complete.
            </section>
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