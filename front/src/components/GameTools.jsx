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
                    title="Passer en mode crayon"
                >
                    Crayon
                </button>

                <button
                    className={`tool-btn ${brushState === 'eraser' ? 'active' : ''}`}
                    onClick={() => onBrushStateChange('eraser')}
                    title="Passer en mode gomme"
                >
                    Gomme
                </button>

                <button
                    className="tool-btn clear-btn"
                    onClick={onClear}
                    title="Effacer le canvas"
                >
                    Effacer
                </button>
            </div>

            <div className="brush-size-control">
                <label htmlFor="brush-size">Taille du trait :</label>
                <input
                    id="brush-size"
                    type="range"
                    value={brushSize}
                    onChange={(e) => onBrushSizeChange(parseInt(e.target.value))}
                    min="1"
                    max="50"
                    title="Ajuster la taille du trait"
                />
                <span className="size-value">{brushSize}px</span>
            </div>
        </div>
    );
}
