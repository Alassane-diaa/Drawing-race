/**
 * useGameLogic Hook
 * Manages game state, timer, categories, and win conditions
 */

import { useState, useEffect, useCallback } from 'react';
import { getRandomCategory, processDrawing } from '../services/gameService';

/**
 * Get initial time based on difficulty
 */
const getInitialTime = (difficulty) => {
    if (difficulty === 'easy') return 20;
    if (difficulty === 'hard') return 10;
    return 15;
};

/**
 * Get confidence threshold based on difficulty
 */
const getConfidenceThreshold = (difficulty) => {
    if (difficulty === 'easy') return 0.8;
    if (difficulty === 'hard') return 0.99;
    return 0.9;
};

/**
 * Hook to manage game logic
 * @param {string} difficulty Game difficulty level
 * @param {Function} onTimeUp Callback when timer reaches 0
 * @param {Function} onVictory Callback when AI recognizes drawing
 * @returns {Object} Game state and handlers
 */
export const useGameLogic = (difficulty = 'medium', onTimeUp, onVictory) => {
    const [isActive, setIsActive] = useState(false);
    const [hasStartedGame, setHasStartedGame] = useState(false);
    const [timeLeft, setTimeLeft] = useState(getInitialTime(difficulty));
    const [targetCategory, setTargetCategory] = useState('');
    const [predictionData, setPredictionData] = useState(null);
    const palierConfidence = getConfidenceThreshold(difficulty);

    // Timer logic
    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((time) => time - 1);
            }, 1000);
        } else if (timeLeft === 0 && hasStartedGame) {
            setIsActive(false);
            if (onTimeUp) {
                onTimeUp(targetCategory);
            }
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft, hasStartedGame, targetCategory, onTimeUp]);

    // Victory condition check
    useEffect(() => {
        if (
            hasStartedGame &&
            predictionData &&
            predictionData.prediction.category === targetCategory &&
            predictionData.prediction.confidence >= palierConfidence
        ) {
            setIsActive(false);
            if (onVictory) {
                onVictory(targetCategory, predictionData.prediction.confidence);
            }
        }
    }, [hasStartedGame, predictionData, targetCategory, palierConfidence, onVictory]);

    const startNewGame = useCallback(async () => {
        setHasStartedGame(true);
        try {
            const categoryData = await getRandomCategory();
            setTargetCategory(categoryData.category);
        } catch (error) {
            console.error('Error fetching category:', error);
        }
        setTimeLeft(getInitialTime(difficulty));
        setIsActive(true);
        setPredictionData(null);
    }, [difficulty]);

    const fetchAndProcessDrawing = useCallback(async (strokeCoords) => {
        try {
            const data = await processDrawing(strokeCoords);
            setPredictionData(data);
        } catch (error) {
            console.error('Error processing drawing:', error);
        }
    }, []);

    const resetGame = useCallback(() => {
        setIsActive(false);
        setHasStartedGame(false);
        setTimeLeft(getInitialTime(difficulty));
        setTargetCategory('');
        setPredictionData(null);
    }, [difficulty]);

    return {
        // State
        isActive,
        hasStartedGame,
        timeLeft,
        targetCategory,
        predictionData,
        palierConfidence,

        // Setters
        setIsActive,
        setTargetCategory,
        setPredictionData,

        // Handlers
        startNewGame,
        fetchAndProcessDrawing,
        resetGame
    };
};
