# 1. Import jsonify for sending JSON responses, and CORS for handling cross-origin requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import ViTForImageClassification, ViTImageProcessor
from PIL import Image
import torch

app = Flask(__name__)
# 2. Set up CORS to allow your React app to make requests
CORS(app, resources={r"/predict": {"origins": "http://localhost:5173"}})


# Load model + processor (same as before)
MODEL_PATH = "tomato-leaf-disease-classification-vit"
processor = ViTImageProcessor.from_pretrained(MODEL_PATH)
model = ViTForImageClassification.from_pretrained(MODEL_PATH)


# 3. We no longer need the home() route that renders index.html
# Your React app is now the home page.


@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    # AI logic is the same as before
    image = Image.open(file.stream).convert("RGB")
    inputs = processor(images=image, return_tensors="pt")
    outputs = model(**inputs)
    preds = torch.nn.functional.softmax(outputs.logits, dim=-1)

    confidence, label_id = torch.max(preds, dim=1)
    label = model.config.id2label[label_id.item()]

    # 4. Instead of rendering a template, return a JSON object
    # This is what your React frontend expects
    return jsonify({
        "disease": label,
        "confidence": confidence.item()
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000) # Flask's default port is 5000