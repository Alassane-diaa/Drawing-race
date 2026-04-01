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
 * Leave lobby as player 2
 */
export const leaveLobby = async (gameId, playerName) => {
    const response = await fetch(`${API_BASE_URL}/game/${gameId}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName })
    });

    if (!response.ok) {
        throw new Error(await parseErrorResponse(response, 'Unable to leave lobby'));
    }
    return response.json();
};

/**
 * Delete lobby as host
 */
export const deleteLobby = async (gameId, playerName) => {
    const response = await fetch(`${API_BASE_URL}/game/${gameId}/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName })
    });

    if (!response.ok) {
        throw new Error(await parseErrorResponse(response, 'Unable to delete lobby'));
    }
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

/**
 * Submit a player's prediction result for synchronized multiplayer scoring
 */
export const submitPrediction = async (gameId, playerName, category, confidence, targetConfidence) => {
    const response = await fetch(`${API_BASE_URL}/game/${gameId}/prediction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName, category, confidence, targetConfidence })
    });

    if (!response.ok) {
        throw new Error(await parseErrorResponse(response, 'Unable to submit prediction'));
    }
    return response.json();
};

/**
 * Request round finalization after synchronized timer expiration
 */
export const finishRound = async (gameId, playerName) => {
    const response = await fetch(`${API_BASE_URL}/game/${gameId}/round/finish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName })
    });

    if (!response.ok) {
        throw new Error(await parseErrorResponse(response, 'Unable to finish round'));
    }
    return response.json();
};

/**
 * Restart an ended multiplayer match with same lobby players
 */
export const restartGame = async (gameId, playerName) => {
    const response = await fetch(`${API_BASE_URL}/game/${gameId}/restart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName })
    });

    if (!response.ok) {
        throw new Error(await parseErrorResponse(response, 'Unable to restart game'));
    }
    return response.json();
};

/**
 * Stop an active match and return to IN_PROGRESS lobby state
 */
export const stopGame = async (gameId, playerName) => {
    const response = await fetch(`${API_BASE_URL}/game/${gameId}/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName })
    });

    if (!response.ok) {
        throw new Error(await parseErrorResponse(response, 'Unable to stop game'));
    }
    return response.json();
};
