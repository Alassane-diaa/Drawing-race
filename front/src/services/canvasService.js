/**
 * Canvas Drawing Service
 * Utilities for canvas rendering and drawing operations
 */

/**
 * Split a continuous line of points into individual strokes based on pen-up/down
 */
export const splitPointsIntoStrokes = (points) => {
    const strokes = [];
    let currentStroke = [];

    points.forEach((point) => {
        if (!Number.isFinite(point?.x) || !Number.isFinite(point?.y)) {
            return;
        }

        currentStroke.push(point);

        if (point.pen === 1) {
            if (currentStroke.length > 0) {
                strokes.push(currentStroke);
            }
            currentStroke = [];
        }
    });

    if (currentStroke.length > 0) {
        strokes.push(currentStroke);
    }

    return strokes;
};

/**
 * Clear canvas
 */
export const clearCanvas = (canvas) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
};

/**
 * Draw centered strokes on canvas with auto-scaling
 */
export const drawCenteredOnCanvas = (canvas, strokes) => {
    if (!canvas || !strokes || strokes.length === 0) {
        clearCanvas(canvas);
        return;
    }

    const validPoints = strokes.flat().filter(
        (point) => Number.isFinite(point?.x) && Number.isFinite(point?.y)
    );

    if (validPoints.length === 0) {
        clearCanvas(canvas);
        return;
    }

    const minX = Math.min(...validPoints.map((point) => point.x));
    const maxX = Math.max(...validPoints.map((point) => point.x));
    const minY = Math.min(...validPoints.map((point) => point.y));
    const maxY = Math.max(...validPoints.map((point) => point.y));

    const drawingWidth = Math.max(maxX - minX, 1);
    const drawingHeight = Math.max(maxY - minY, 1);
    const fitScale = Math.min(
        (canvas.width * 0.9) / drawingWidth,
        (canvas.height * 0.9) / drawingHeight
    );
    const scale = Math.max(0.1, fitScale);

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const transformPoint = (point) => ({
        x: (point.x - centerX) * scale + canvas.width / 2,
        y: (point.y - centerY) * scale + canvas.height / 2,
        pen: point.pen,
    });

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'black';

    strokes.forEach((stroke) => {
        const transformedStroke = stroke
            .filter((point) => Number.isFinite(point?.x) && Number.isFinite(point?.y))
            .map(transformPoint);

        if (transformedStroke.length === 0) {
            return;
        }

        if (transformedStroke.length === 1) {
            const point = transformedStroke[0];
            ctx.beginPath();
            ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
            ctx.fillStyle = 'black';
            ctx.fill();
            ctx.closePath();
            return;
        }

        ctx.beginPath();
        ctx.moveTo(transformedStroke[0].x, transformedStroke[0].y);
        for (let index = 1; index < transformedStroke.length; index += 1) {
            const point = transformedStroke[index];
            ctx.lineTo(point.x, point.y);
        }
        ctx.stroke();
        ctx.closePath();
    });
};

/**
 * Draw on canvas (regular drawing mode - pen or eraser)
 */
export const setupCanvasStyle = (ctx, brushSize, brushState) => {
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = brushState === 'pen' ? 'black' : 'white';
};

/**
 * Draw a single point (for click events)
 */
export const drawPoint = (canvas, x, y, brushState) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = brushState === 'pen' ? 'black' : 'white';
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, 2 * Math.PI);
    ctx.fill();
};
