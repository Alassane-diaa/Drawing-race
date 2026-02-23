import torch
import torch.nn as nn
import os
import json
from flask import Flask, request, jsonify
from utils import Data
from model import GRUModel
DEVICE = "cpu"


with open("categories.json", 'r') as file:
    cats = json.load(file)

model = torch.load(os.path.join("models", "GRUModel.pt"), weights_only=False).to(DEVICE)

model.eval()

data = Data()

app = Flask(__name__)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get stroke data from Java: {"points": [{"x": 10, "y": 20}, ...]}
        # data.clear()
        stroke_data = request.json
        data.process_data(stroke_data)
        tensor_input, length_ = data.get_data()
        print(tensor_input.shape)
        # print(tensor_input[:,-5:])
        
        # Get prediction
        with torch.no_grad():
            output = model(tensor_input, length_)
            probabilities = torch.softmax(output, dim=1)
            
            # Get top 10 predictions
            top10_probs, top10_indices = torch.topk(probabilities, k=10, dim=1)
            top10_probs = top10_probs.squeeze().tolist()
            top10_indices = top10_indices.squeeze().tolist()
            
            # Get top prediction
            prediction_ind = top10_indices[0]
            prediction_class = cats[prediction_ind]
            confidence = top10_probs[0]
            
            # Print top 10 categories
            print("Top 10 predictions:")
            for i, (idx, prob) in enumerate(zip(top10_indices, top10_probs), 1):
                print(f"{i}. {cats[idx]} - {prob:.4f}")
        
        return jsonify({
            'prediction': {'category': cats[prediction_ind], 'confidence': float(confidence)},
            'top10': [{'category': cats[idx], 'confidence': float(prob)} 
                      for idx, prob in zip(top10_indices, top10_probs)]
        })
    
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

