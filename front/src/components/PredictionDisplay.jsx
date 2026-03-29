/**
 * PredictionDisplay Component
 * Displays AI prediction results
 */

export default function PredictionDisplay({ predictionData }) {
    if (!predictionData) {
        return (
            <div className="prediction-display empty">
                <p>Draw something to get predictions!</p>
            </div>
        );
    }

    const { prediction, top10 } = predictionData;
    const confidencePercent = (prediction.confidence * 100).toFixed(2);

    return (
        <div className="prediction-display">
            <div className="top-prediction">
                <h2>Top Prediction: {prediction.category}</h2>
                <div className="confidence-bar">
                    <div 
                        className="confidence-fill" 
                        style={{ width: `${prediction.confidence * 100}%` }}
                    />
                </div>
                <p>Confidence: {confidencePercent}%</p>
            </div>

            <div className="top10-predictions">
                <h3>Top 10 Predictions:</h3>
                <ol>
                    {top10.map((pred, index) => (
                        <li key={index}>
                            <span className="category-name">{pred.category}</span>
                            <span className="category-confidence">
                                {(pred.confidence * 100).toFixed(2)}%
                            </span>
                        </li>
                    ))}
                </ol>
            </div>
        </div>
    );
}
