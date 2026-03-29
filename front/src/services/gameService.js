/**
 * Game API Service
 * Centralized API calls for game operations
 */

const API_BASE_URL = 'http://localhost:8080';

const parseErrorResponse = async (response, fallbackMessage) => {
    try {
        const data = await response.json();
        return data.message || fallbackMessage;
    } catch {
        return fallbackMessage;
    }
};

/**
 * Create a new game
 */
export const createGame = async (playerName) => {
    const response = await fetch(`${API_BASE_URL}/game/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName })
    });

    if (!response.ok) {
        throw new Error(await parseErrorResponse(response, 'Unable to create game'));
    }
    return response.json();
};

/**
 * Join a specific game
 */
export const joinGame = async (gameId, playerName) => {
    const response = await fetch(`${API_BASE_URL}/game/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, playerName })
    });

    if (!response.ok) {
        throw new Error(await parseErrorResponse(response, 'Unable to join game'));
    }
    return response.json();
};

/**
 * Join a random game
 */
export const joinRandomGame = async (playerName) => {
    const response = await fetch(`${API_BASE_URL}/game/connect/random`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName })
    });

    if (!response.ok) {
        throw new Error(await parseErrorResponse(response, 'Unable to join random game'));
    }
    return response.json();
};

/**
 * Mark player as ready
 */
export const markPlayerReady = async (gameId, playerName) => {
    const response = await fetch(`${API_BASE_URL}/game/${gameId}/ready`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName })
    });

    if (!response.ok) {
        throw new Error(await parseErrorResponse(response, 'Unable to mark as ready'));
    }
    return response.json();
};

/**
 * Mark player as not ready
 */
export const markPlayerNotReady = async (gameId, playerName) => {
    const response = await fetch(`${API_BASE_URL}/game/${gameId}/unready`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName })
    });

    if (!response.ok) {
        throw new Error(await parseErrorResponse(response, 'Unable to mark as not ready'));
    }
    return response.json();
};

/**
 * Start a multiplayer game
 */
export const startGame = async (gameId, playerName) => {
    const response = await fetch(`${API_BASE_URL}/game/${gameId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName })
    });

    if (!response.ok) {
        throw new Error(await parseErrorResponse(response, 'Unable to start game'));
    }
    return response.json();
};

/**
 * Fetch current game state
 */
export const getGameState = async (gameId) => {
    const response = await fetch(`${API_BASE_URL}/game/${gameId}`);
    if (!response.ok) {
        throw new Error(`Unable to restore game state (status ${response.status})`);
    }
    return response.json();
};

/**
 * Fetch random drawing category
 */
export const getRandomCategory = async () => {
    const response = await fetch(`${API_BASE_URL}/random-category`);
    if (!response.ok) {
        throw new Error('Unable to fetch category');
    }
    return response.json();
};

/**
 * Process drawing for AI prediction
 */
export const processDrawing = async (points) => {
    const response = await fetch(`${API_BASE_URL}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points })
    });

    if (!response.ok) {
        throw new Error('Unable to process drawing');
    }
    return response.json();
};
