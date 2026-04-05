// badgeService.js
// Service front-end pour les appels API relatifs aux badges.
// Routes : GET /badge, GET /badge/mine, POST /badge/{id}/unlock

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

function authHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

async function handleResponse(response) {
    if (!response.ok) {
        const errorText = await response.text().catch(() => 'Erreur inconnue');
        throw new Error(`HTTP ${response.status} — ${errorText}`);
    }
    if (response.status === 204) return null;
    return response.json();
}

// ─────────────────────────────────────────────
// GET /badge
// Tous les badges existants (publique, pas de token requis).
// Retourne : BadgeDTO[] — { id, name, description, unlockedAt: null }
// ─────────────────────────────────────────────
export async function getAllBadges() {
    const response = await fetch(`${API_BASE}/badge`, {
        method: 'GET',
        headers: authHeaders(),
    });
    return handleResponse(response);
}

// ─────────────────────────────────────────────
// GET /badge/mine
// Badges débloqués par le joueur connecté.
// Retourne : BadgeDTO[] — { id, name, description, unlockedAt: "2025-..." }
// ─────────────────────────────────────────────
export async function getMyBadges() {
    const response = await fetch(`${API_BASE}/badge/mine`, {
        method: 'GET',
        headers: authHeaders(),
    });
    return handleResponse(response);
}

// ─────────────────────────────────────────────
// POST /badge/{badgeId}/unlock
// Débloque un badge pour le joueur connecté.
// Retourne : BadgeDTO avec unlockedAt renseigné
// Lève une erreur HTTP 409 si déjà débloqué, 404 si badge inconnu.
// ─────────────────────────────────────────────
export async function unlockBadge(badgeId) {
    const response = await fetch(`${API_BASE}/badge/${badgeId}/unlock`, {
        method: 'POST',
        headers: authHeaders(),
    });
    return handleResponse(response);
}

// ─────────────────────────────────────────────
// Helper : fusionne tous les badges avec le statut débloqué du joueur.
// Appelle getAllBadges() et getMyBadges() en parallèle,
// puis retourne un tableau unifié avec { ...badge, unlocked, unlockedAt }.
//
// Usage : const badges = await getMergedBadges();
// ─────────────────────────────────────────────
export async function getMergedBadges() {
    const [all, mine] = await Promise.all([getAllBadges(), getMyBadges()]);

    const unlockedMap = new Map(mine.map(b => [b.id, b.unlockedAt]));

    return all.map(badge => ({
        ...badge,
        unlocked:   unlockedMap.has(badge.id),
        unlockedAt: unlockedMap.get(badge.id) ?? null,
    }));
}

// ─────────────────────────────────────────────
// Helper : vérifie les conditions de déblocage automatique côté front
// et appelle unlockBadge() si la condition est remplie et le badge pas encore débloqué.
//
// Paramètres :
//   stats        — AppUser courant
//   mergedBadges — résultat de getMergedBadges()
//
// Badges vérifiés automatiquement (ids 1–14 du seeder) :
//   1  → Première victoire  (wins >= 1)
//   2  → Habitué            (gamesPlayed >= 10)
//   3  → Vétéran            (gamesPlayed >= 50)
//   4  → Centurion          (gamesPlayed >= 100)
//   5  → Tireur d'élite     (accuracy >= 90)
//   6  → Sniper             (accuracy >= 95)
//   7  → Perfectionniste    (accuracy >= 100)
//   11 → Podium             (géré côté serveur, ignoré ici)
//   12 → Champion           (wins >= 10)
//   13 → Grand champion     (wins >= 50)
//   14 → Légende            (wins >= 100)
//
// Retourne : liste des BadgeDTO fraîchement débloqués (peut être vide)
// ─────────────────────────────────────────────
export async function checkAndUnlockBadges(stats, mergedBadges) {
    const conditions = [
        { id: 1,  met: stats.wins >= 1 },
        { id: 2,  met: stats.gamesPlayed >= 10 },
        { id: 3,  met: stats.gamesPlayed >= 50 },
        { id: 4,  met: stats.gamesPlayed >= 100 },
        { id: 5,  met: stats.accuracy >= 90 },
        { id: 6,  met: stats.accuracy >= 95 },
        { id: 7,  met: stats.accuracy >= 100 },
        { id: 12, met: stats.wins >= 10 },
        { id: 13, met: stats.wins >= 50 },
        { id: 14, met: stats.wins >= 100 },
    ];

    const unlockedSet = new Set(mergedBadges.filter(b => b.unlocked).map(b => b.id));

    const toUnlock = conditions.filter(c => c.met && !unlockedSet.has(c.id));

    // Déblocage en parallèle, on ignore les 409 (déjà débloqué)
    const results = await Promise.allSettled(
        toUnlock.map(c => unlockBadge(c.id))
    );

    return results
        .filter(r => r.status === 'fulfilled' && r.value !== null)
        .map(r => r.value);
}