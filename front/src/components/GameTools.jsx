/**
 * GameTools Component
 * Provides drawing tools (pen, eraser, clear, brush size)
 */

export default function GameTools({
    brushState,
    brushSize,
    onBrushStateChange,
    onBrushSizeChange,
    onClear
}) {
    return (
        <div className="game-tools">
            <div className="tool-buttons">
                <button
                    className={`tool-btn ${brushState === 'pen' ? 'active' : ''}`}
                    onClick={() => onBrushStateChange('pen')}
                    title="Switch to pen"
                >
                    Pen
                </button>

                <button
                    className={`tool-btn ${brushState === 'eraser' ? 'active' : ''}`}
                    onClick={() => onBrushStateChange('eraser')}
                    title="Switch to eraser"
                >
                    Eraser
                </button>

                <button
                    className="tool-btn clear-btn"
                    onClick={onClear}
                    title="Clear canvas"
                >
                    Clear
                </button>
            </div>

            <div className="brush-size-control">
                <label htmlFor="brush-size">Brush Size:</label>
                <input
                    id="brush-size"
                    type="range"
                    value={brushSize}
                    onChange={(e) => onBrushSizeChange(parseInt(e.target.value))}
                    min="1"
                    max="50"
                    title="Adjust brush size"
                />
                <span className="size-value">{brushSize}px</span>
            </div>
        </div>
    );
}
