/**
 * useCanvasDrawing Hook
 * Manages drawing interactions on canvas (mouse events, pen/eraser state)
 */

import { useState, useRef, useCallback } from 'react';
import { setupCanvasStyle, drawPoint } from '../services/canvasService';

/**
 * Hook to manage canvas drawing
 * @param {Object} canvasRef Reference to the canvas element
 * @param {Function} onStrokeComplete Callback when a stroke is finished
 * @param {Function} onClear Callback when canvas is cleared
 * @returns {Object} Drawing state and handlers
 */
export const useCanvasDrawing = (canvasRef, onStrokeComplete, onClear) => {
    const [isDrawing, setIsDrawing] = useState(false);
    const [brushState, setBrushState] = useState('pen'); // 'pen' or 'eraser'
    const [brushSize, setBrushSize] = useState(5);
    const [strokeCoords, setStrokeCoords] = useState([]);
    const currentStrokeRef = useRef([]);

    const clearCanvas = useCallback(() => {
        setStrokeCoords([]);
        currentStrokeRef.current = [];
        setIsDrawing(false);

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (onClear) {
            onClear();
        }
    }, [canvasRef, onClear]);

    const onMouseDownCanvas = useCallback((event) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const pen = 0;

        setupCanvasStyle(ctx, brushSize, brushState);
        ctx.beginPath();
        ctx.moveTo(x, y);

        setIsDrawing(true);
        currentStrokeRef.current = [{ x, y, pen }];
    }, [brushSize, brushState, canvasRef]);

    const handleMouseMoveCanvas = useCallback((event) => {
        const canvas = canvasRef.current;
        if (!canvas || !isDrawing) return;

        if (event.buttons === 1) { // Left mouse button
            const ctx = canvas.getContext('2d');
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            const pen = 0;

            ctx.lineTo(x, y);
            ctx.stroke();
            currentStrokeRef.current.push({ x, y, pen });
        }
    }, [canvasRef, isDrawing]);

    const handleMouseUpCanvas = useCallback((event) => {
        if (!isDrawing) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        setIsDrawing(false);

        const ctx = canvas.getContext('2d');
        ctx.closePath();

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const pen = 1;

        const finishedStroke = [...currentStrokeRef.current, { x, y, pen }];
        currentStrokeRef.current = [];

        const updatedCoords = [...strokeCoords, ...finishedStroke];
        setStrokeCoords(updatedCoords);

        if (onStrokeComplete) {
            onStrokeComplete(finishedStroke, updatedCoords);
        }
    }, [isDrawing, canvasRef, strokeCoords, onStrokeComplete]);

    const onClickCanvas = useCallback((event) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        drawPoint(canvas, x, y, brushState);

        const clickPoint = { x, y, pen: 1 };
        const updatedCoords = [...strokeCoords, clickPoint];
        setStrokeCoords(updatedCoords);

        if (onStrokeComplete) {
            onStrokeComplete([clickPoint], updatedCoords);
        }
    }, [canvasRef, brushState, strokeCoords, onStrokeComplete]);

    return {
        // State
        isDrawing,
        brushState,
        brushSize,
        strokeCoords,

        // Setters
        setBrushState,
        setBrushSize,
        setStrokeCoords,

        // Handlers
        onMouseDownCanvas,
        handleMouseMoveCanvas,
        handleMouseUpCanvas,
        onClickCanvas,
        clearCanvas
    };
};
