import { useAuth } from '../hooks/useAuth';
import { useEffect, useRef, useState } from 'react';
import {
    getMyStats,
    getLeaderboard,
    getAvatarUrl,
    uploadAvatar,
    computeWinrate,
    formatAccuracy,
} from '../services/UserService';
import { getMergedBadges } from '../services/BadgeService';
import './StatsPage.css';

export default function StatsPage() {
    const { user, isUser } = useAuth();

    const [stats, setStats]           = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [badges, setBadges]         = useState([]);
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState('');
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [avatarError, setAvatarError]         = useState('');

    // Référence vers l'input file caché
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (!isUser) { setLoading(false); return; }

        async function fetchAll() {
            try {
                setLoading(true);
                setError('');

                const [myStats, board, mergedBadges] = await Promise.all([
                    getMyStats(),
                    getLeaderboard(),
                    getMergedBadges(),
                ]);

                setStats(myStats);
                setLeaderboard(board);
                setBadges(mergedBadges);
            } catch (err) {
                setError('Impossible de charger les données : ' + err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchAll();
    }, [isUser]);

    // ── Gestion de l'upload avatar ────────────────────────────────────────────
    async function handleAvatarChange(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation côté client : image uniquement, max 2 Mo
        if (!file.type.startsWith('image/')) {
            setAvatarError('Le fichier doit être une image.');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            setAvatarError('Image trop lourde (max 2 Mo).');
            return;
        }

        try {
            setAvatarUploading(true);
            setAvatarError('');
            await uploadAvatar(file);
            // Rafraîchit les stats pour récupérer le nouveau avatarFilename
            const updated = await getMyStats();
            setStats(updated);
        } catch (err) {
            setAvatarError("Erreur lors de l'upload : " + err.message);
        } finally {
            setAvatarUploading(false);
            // Réinitialise l'input pour permettre de re-sélectionner le même fichier
            e.target.value = '';
        }
    }

    // ── Dérivations locales ───────────────────────────────────────────────────
    const winrate  = computeWinrate(stats);
    const accuracy = formatAccuracy(stats?.accuracy);
    const losses   = stats ? stats.gamesPlayed - stats.wins : 0;
    const myRank   = leaderboard.findIndex(u => u.username === stats?.username) + 1;

    const unlockedBadges = badges.filter(b => b.unlocked);
    const lockedBadges   = badges.filter(b => !b.unlocked);

    // ── États d'erreur / chargement ───────────────────────────────────────────
    if (!isUser) return (
        <div className="stats-page">
            <section className="stats-head">
                <h1>Stats</h1>
                <p className="stats-message">Connecte-toi pour voir tes statistiques.</p>
            </section>
        </div>
    );

    if (loading) return (
        <div className="stats-page">
            <section className="stats-head">
                <h1>Stats</h1>
                <p className="stats-message loading-dots">Chargement</p>
            </section>
        </div>
    );

    if (error) return (
        <div className="stats-page">
            <section className="stats-head">
                <h1>Stats</h1>
                <p className="stats-error">{error}</p>
            </section>
        </div>
    );

    return (
        <div className="stats-page">

            {/* ── Profil ── */}
            <section className="stats-head">
                <div className="profile-card">

                    {/* Avatar + bouton changement */}
                    <div className="avatar-wrapper">
                        {stats?.avatarFilename ? (
                            <img
                                className="avatar"
                                src={getAvatarUrl(stats.avatarFilename)}
                                alt={`Avatar de ${stats.username}`}
                            />
                        ) : (
                            <div className="avatar avatar-placeholder">
                                {stats?.username?.[0]?.toUpperCase() ?? '?'}
                            </div>
                        )}

                        {/* Overlay au survol */}
                        <button
                            className="avatar-change-btn"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={avatarUploading}
                            title="Changer l'avatar"
                        >
                            {avatarUploading ? '…' : '✎'}
                        </button>

                        {/* Input file caché */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleAvatarChange}
                        />
                    </div>

                    <div className="profile-info">
                        <h1>{stats?.username}</h1>
                        <span className="rank-badge">{stats?.rank ?? 'Noob'}</span>
                        {myRank > 0 && (
                            <span className="leaderboard-rank">#{myRank} au classement</span>
                        )}
                        {avatarError && (
                            <p className="avatar-error">{avatarError}</p>
                        )}
                    </div>
                </div>
            </section>

            {/* ── Grille stats ── */}
            <section className="stats-grid">
                <article className="stat-card">
                    <h3>Parties</h3>
                    <div className="stat-value">{stats?.gamesPlayed ?? '—'}</div>
                    <div className="stat-sub">
                        <span className="wins">{stats?.wins ?? 0}V</span>
                        {' / '}
                        <span className="losses">{losses}D</span>
                    </div>
                </article>

                <article className="stat-card">
                    <h3>Winrate</h3>
                    <div className="stat-value">{winrate}</div>
                    <div className="stat-sub">sur {stats?.gamesPlayed ?? 0} parties</div>
                </article>

                <article className="stat-card">
                    <h3>Précision</h3>
                    <div className="stat-value">{accuracy}</div>
                    <div className="stat-sub">moyenne générale</div>
                </article>
            </section>

            {/* ── Badges ── */}
            {badges.length > 0 && (
                <section className="badges-section">
                    <h2>
                        Badges
                        <span className="badge-count">
                            {unlockedBadges.length} / {badges.length}
                        </span>
                    </h2>

                    {unlockedBadges.length > 0 && (
                        <>
                            <h3 className="badge-subheader">Débloqués</h3>
                            <div className="badges-grid">
                                {unlockedBadges.map(badge => (
                                    <div key={badge.id} className="badge-card unlocked" title={badge.description}>
                                        <div className="badge-icon">🏅</div>
                                        <div className="badge-name">{badge.name}</div>
                                        <div className="badge-desc">{badge.description}</div>
                                        {badge.unlockedAt && (
                                            <div className="badge-date">
                                                {new Date(badge.unlockedAt).toLocaleDateString('fr-FR')}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {lockedBadges.length > 0 && (
                        <>
                            <h3 className="badge-subheader locked-label">Verrouillés</h3>
                            <div className="badges-grid">
                                {lockedBadges.map(badge => (
                                    <div key={badge.id} className="badge-card locked" title={badge.description}>
                                        <div className="badge-icon">🔒</div>
                                        <div className="badge-name">{badge.name}</div>
                                        <div className="badge-desc">{badge.description}</div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </section>
            )}

            {/* ── Leaderboard ── */}
            {leaderboard.length > 0 && (
                <section className="leaderboard-section">
                    <h2>Classement</h2>
                    <ol className="leaderboard-list">
                        {leaderboard.map((u, index) => (
                            <li
                                key={u.id}
                                className={`leaderboard-row${u.username === stats?.username ? ' me' : ''}`}
                            >
                                <span className="lb-rank">#{index + 1}</span>
                                {u.avatarFilename ? (
                                    <img
                                        className="lb-avatar"
                                        src={getAvatarUrl(u.avatarFilename)}
                                        alt={u.username}
                                    />
                                ) : (
                                    <div className="lb-avatar lb-avatar-placeholder">
                                        {u.username?.[0]?.toUpperCase()}
                                    </div>
                                )}
                                <span className="lb-username">{u.username}</span>
                                <span className="lb-rank-label">{u.rank}</span>
                                <span className="lb-wins">{u.wins} victoires</span>
                            </li>
                        ))}
                    </ol>
                </section>
            )}
        </div>
    );
}