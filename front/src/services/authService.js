const API_URL = "http://localhost:8080/auth";

export const authService = {
    login: async (username, password) => {
        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });
        if (!response.ok) {
            throw new Error("Login failed");
        }
        return response.json();
    },

    register: async (username, password) => {
        const response = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });
        if (!response.ok) {
            throw new Error("Registration failed");
        }
        return response.json();
    },

    verifyToken: async (token) => {
        const response = await fetch("http://localhost:8080/test", {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            }
        });
        return response.ok;
    }
};
