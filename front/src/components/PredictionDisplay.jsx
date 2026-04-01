/**
 * PredictionDisplay Component
 * Displays AI prediction results
 */

export default function PredictionDisplay({ predictionData, className = '' }) {
    if (!predictionData) {
        return (
            <div className={`prediction-display empty ${className}`.trim()}>
                <p>Draw something to get predictions!</p>
            </div>
        );
    }

    const { prediction } = predictionData;
    const confidencePercent = (prediction.confidence * 100).toFixed(2);

    return (
        <div className={`prediction-display ${className}`.trim()}>
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
        </div>
    );
}
