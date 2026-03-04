import torch
import os
from flask import Flask, request, jsonify
from utils import Data
from models import GRUModel, CNNModel

DEVICE = "cpu"



model_gru = torch.load(os.path.join("models", "GRUModel.pt"), weights_only=False, map_location=torch.device(DEVICE)).to(DEVICE)
model_cnn = torch.load(os.path.join("models", "CNNModel.pt"), weights_only=False, map_location=torch.device(DEVICE)).to(DEVICE)
model_gru.eval()
model_cnn.eval()
data = Data()

app = Flask(__name__)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get stroke data from Java: {"points": [{"x": 10, "y": 20}, ...]}
        # data.clear()
        stroke_data = request.json
        data.process_data(stroke_data)
        tensor_gru, length_, tensor_cnn = data.get_data()        
        top_cats, top_probs = data.pre_models(model_gru, tensor_gru, length_, model_cnn, tensor_cnn)
 
        return jsonify({
            'prediction': {'category': top_cats[0], 'confidence': float(top_probs[0])},
            'top10': [{'category': cat, 'confidence': float(prob)} 
                      for cat, prob in zip(top_cats, top_probs)]
        })
    
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

