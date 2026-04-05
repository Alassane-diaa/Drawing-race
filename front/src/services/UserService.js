// userService.js
// Service front-end pour les appels API relatifs aux utilisateurs et statistiques.
// Le token JWT est lu depuis le localStorage (clé "token").

const API_BASE = 'http://localhost:8080';

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
// GET /user/me
// Stats + infos du joueur connecté.
// Retourne : { id, username, gamesPlayed, wins, accuracy, rank, avatarFilename }
// ─────────────────────────────────────────────
export async function getMyStats() {
    const response = await fetch(`${API_BASE}/user/me`, {
        method: 'GET',
        headers: authHeaders(),
    });
    return handleResponse(response);
}

// ─────────────────────────────────────────────
// GET /user/{username}
// Profil public d'un utilisateur.
// ─────────────────────────────────────────────
export async function getUserByUsername(username) {
    const response = await fetch(`${API_BASE}/user/${encodeURIComponent(username)}`, {
        method: 'GET',
        headers: authHeaders(),
    });
    return handleResponse(response);
}

// ─────────────────────────────────────────────
// GET /user/leaderboard
// Classement trié par victoires (desc). Retourne : AppUser[]
// ─────────────────────────────────────────────
export async function getLeaderboard() {
    const response = await fetch(`${API_BASE}/user/leaderboard`, {
        method: 'GET',
        headers: authHeaders(),
    });
    return handleResponse(response);
}

// ─────────────────────────────────────────────
// PUT /user/stats  — helper interne
// Corps attendu : { gamesPlayed, wins, accuracy }
// ─────────────────────────────────────────────
async function putStats(body) {
    const response = await fetch(`${API_BASE}/user/stats`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(body),
    });
    return handleResponse(response);
}

// ─────────────────────────────────────────────
// Enregistre une victoire pour le joueur connecté.
// Incrémente wins ET gamesPlayed.
// Paramètres :
//   currentStats — AppUser courant (résultat de getMyStats)
//   newAccuracy  — nouvelle précision (optionnel, garde l'ancienne sinon)
// Retourne : AppUser mis à jour
// ─────────────────────────────────────────────
export async function addWin(currentStats, newAccuracy) {
    return putStats({
        gamesPlayed: currentStats.gamesPlayed + 1,
        wins:        currentStats.wins + 1,
        accuracy:    newAccuracy ?? currentStats.accuracy,
    });
}

// ─────────────────────────────────────────────
// Enregistre une défaite (partie jouée sans victoire).
// Incrémente uniquement gamesPlayed.
// Paramètres :
//   currentStats — AppUser courant
//   newAccuracy  — optionnel
// Retourne : AppUser mis à jour
// ─────────────────────────────────────────────
export async function addGame(currentStats, newAccuracy) {
    return putStats({
        gamesPlayed: currentStats.gamesPlayed + 1,
        wins:        currentStats.wins,
        accuracy:    newAccuracy ?? currentStats.accuracy,
    });
}

// ─────────────────────────────────────────────
// Construit l'URL publique de l'avatar (à utiliser dans <img src=...>).
// ─────────────────────────────────────────────
export function getAvatarUrl(filename) {
    if (!filename) return null;
    return `${API_BASE}/user/avatar/${encodeURIComponent(filename)}`;
}

// ─────────────────────────────────────────────
// POST /user/avatar  (multipart/form-data)
// file — objet File depuis un <input type="file">
// Retourne : { filename: "..." }
// ─────────────────────────────────────────────
export async function uploadAvatar(file) {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await fetch(`${API_BASE}/user/avatar`, {
        method: 'POST',
        // PAS de Content-Type manuel : le navigateur ajoute le boundary multipart
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
    });
    return handleResponse(response);
}

// ─────────────────────────────────────────────
// DELETE /user/avatar
// Supprime l'avatar du joueur connecté.
// ─────────────────────────────────────────────
export async function deleteAvatar() {
    const response = await fetch(`${API_BASE}/user/avatar`, {
        method: 'DELETE',
        headers: authHeaders(),
    });
    return handleResponse(response);
}

// ─────────────────────────────────────────────
// Helpers de calcul local (pas d'appel réseau)
// ─────────────────────────────────────────────

/** Retourne "62.5%" ou "—" si aucune partie. */
export function computeWinrate(user) {
    if (!user || user.gamesPlayed === 0) return '—';
    return ((user.wins / user.gamesPlayed) * 100).toFixed(1) + '%';
}

/**
 * Formate l'accuracy en %.
 * Si le back stocke une valeur entre 0 et 1, décommentez le ×100.
 */
export function formatAccuracy(accuracy) {
    if (accuracy == null) return '—';
    // return (accuracy * 100).toFixed(1) + '%'; // si 0–1
    return accuracy.toFixed(1) + '%';
}