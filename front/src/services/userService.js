const API_URL = "http://localhost:8080/user";

export const userService = {

    // Stats du joueur connecté
    getMyStats: async (token) => {
        const response = await fetch(`${API_URL}/me`, {
            method: "GET",
            headers: { "Authorization": "Bearer " + token }
        });
        if (!response.ok) throw new Error("Impossible de récupérer les stats");
        return response.json();
    },

    // Profil public d'un autre joueur
    getPublicProfile: async (username) => {
        const response = await fetch(`${API_URL}/${username}`);
        if (!response.ok) throw new Error("Utilisateur introuvable");
        return response.json();
    },

    // Classement
    getLeaderboard: async () => {
        const response = await fetch(`${API_URL}/leaderboard`);
        if (!response.ok) throw new Error("Impossible de récupérer le classement");
        return response.json();
    },

    // Mise à jour des stats
    updateStats: async (token, gamesPlayed, wins, accuracy) => {
        const response = await fetch(`${API_URL}/stats`, {
            method: "PUT",
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ gamesPlayed, wins, accuracy })
        });
        if (!response.ok) throw new Error("Mise à jour échouée");
        return response.json();
    },

    // Upload avatar
    uploadAvatar: async (token, file) => {
        const formData = new FormData();
        formData.append("avatar", file);

        const response = await fetch(`${API_URL}/avatar`, {
            method: "POST",
            headers: { "Authorization": "Bearer " + token }
            // pas de Content-Type — le navigateur le gère
        });
        if (!response.ok) throw new Error("Upload échoué");
        return response.json();
    },

    // Supprimer avatar
    deleteAvatar: async (token) => {
        const response = await fetch(`${API_URL}/avatar`, {
            method: "DELETE",
            headers: { "Authorization": "Bearer " + token }
        });
        if (!response.ok) throw new Error("Suppression échouée");
        return response.json();
    }
};