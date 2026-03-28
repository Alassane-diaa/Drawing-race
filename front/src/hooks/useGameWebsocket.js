/**
 * useGameWebsocket Hook
 * Manages WebSocket connections for game events and strokes
 */

import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WS_BASE_URL = 'http://localhost:8080/ws';

/**
 * Hook to manage game WebSocket connection
 * @param {Object} config Configuration object
 * @param {string} config.gameId Game ID
 * @param {string} config.playerName Current player name
 * @param {boolean} config.enabled Whether the connection is enabled
 * @param {Function} config.onStrokeReceived Callback when opponent stroke is received
 * @param {Function} config.onGameEvent Callback when game event occurs
 * @param {Function} config.onGameStateChanged Callback when game state changes
 * @param {Function} config.onError Callback for connection errors
 * @returns {Object} { clientRef, isConnectedRef, client, isConnected }
 */
export const useGameWebsocket = ({
    gameId,
    playerName,
    enabled = true,
    onStrokeReceived,
    onGameEvent,
    onGameStateChanged,
    onError
}) => {
    const clientRef = useRef(null);
    const isConnectedRef = useRef(false);

    useEffect(() => {
        if (!enabled || !gameId || !playerName) {
            return;
        }

        const client = new Client({
            webSocketFactory: () => new SockJS(WS_BASE_URL),
            reconnectDelay: 5000,
        });

        client.onConnect = () => {
            isConnectedRef.current = true;

            // Subscribe to opponent strokes
            if (onStrokeReceived) {
                client.subscribe(`/topic/game/${gameId}/stroke`, (frame) => {
                    const payload = JSON.parse(frame.body);
                    if (payload.playerName !== playerName) {
                        onStrokeReceived(payload);
                    }
                });
            }

            // Subscribe to game events
            if (onGameEvent) {
                client.subscribe(`/topic/game/${gameId}/event`, (frame) => {
                    const gameEvent = JSON.parse(frame.body);
                    onGameEvent(gameEvent);
                });
            }

            // Subscribe to game state changes
            if (onGameStateChanged) {
                client.subscribe(`/topic/game/${gameId}/state`, (frame) => {
                    const state = JSON.parse(frame.body);
                    onGameStateChanged(state);
                });
            }
        };

        client.onStompError = (frame) => {
            isConnectedRef.current = false;
            if (onError) {
                onError(frame.headers.message || 'WebSocket error');
            }
        };

        client.activate();
        clientRef.current = client;

        return () => {
            if (clientRef.current) {
                clientRef.current.deactivate();
                isConnectedRef.current = false;
            }
        };
    }, [enabled, gameId, playerName, onStrokeReceived, onGameEvent, onGameStateChanged, onError]);

    return {
        clientRef,
        isConnectedRef,
        client: clientRef.current,
        isConnected: isConnectedRef.current
    };
};

/**
 * Hook to manage lobby WebSocket connection
 * @param {Object} config Configuration object
 * @param {string} config.gameId Game ID
 * @param {string} config.playerName Current player name
 * @param {boolean} config.enabled Whether the connection is enabled
 * @param {Function} config.onStateChanged Callback when game state changes
 * @param {Function} config.onEvent Callback when event occurs
 * @param {Function} config.onError Callback for errors
 * @returns {Object} { clientRef, isConnectedRef, client, isConnected }
 */
export const useLobbyWebsocket = ({
    gameId,
    playerName,
    enabled = true,
    onStateChanged,
    onEvent,
    onError
}) => {
    const clientRef = useRef(null);
    const isConnectedRef = useRef(false);

    useEffect(() => {
        if (!enabled || !gameId || !playerName) {
            return;
        }

        const client = new Client({
            webSocketFactory: () => new SockJS(WS_BASE_URL),
            reconnectDelay: 5000,
        });

        client.onConnect = () => {
            isConnectedRef.current = true;

            // Subscribe to game state
            if (onStateChanged) {
                client.subscribe(`/topic/game/${gameId}/state`, (frame) => {
                    const gameState = JSON.parse(frame.body);
                    onStateChanged(gameState);
                });
            }

            // Subscribe to game events
            if (onEvent) {
                client.subscribe(`/topic/game/${gameId}/event`, (frame) => {
                    const gameEvent = JSON.parse(frame.body);
                    onEvent(gameEvent);
                });
            }
        };

        client.onStompError = (frame) => {
            isConnectedRef.current = false;
            if (onError) {
                onError(frame.headers.message || 'WebSocket error');
            }
        };

        client.activate();
        clientRef.current = client;

        return () => {
            if (clientRef.current) {
                clientRef.current.deactivate();
                isConnectedRef.current = false;
            }
        };
    }, [enabled, gameId, playerName, onStateChanged, onEvent, onError]);

    return {
        clientRef,
        isConnectedRef,
        client: clientRef.current,
        isConnected: isConnectedRef.current
    };
};

/**
 * Utility to publish a stroke to the server
 */
export const publishStroke = (client, gameId, playerName, strokePoints) => {
    if (client?.connected) {
        client.publish({
            destination: `/app/game/${gameId}/stroke`,
            body: JSON.stringify({
                playerName,
                stroke: { points: strokePoints }
            })
        });
    }
};
