# api/app.py
from flask import Flask, request, jsonify
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import os

# Create Flask app
app = Flask(__name__)

# Load model and tokenizer
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "results", "final_model")
print(f"Loading model from: {os.path.abspath(MODEL_PATH)}")

tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)
model.eval()

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        text = data.get("text", "")
        
        if not text.strip():
            return jsonify({"error": "No text provided"}), 400
        
        inputs = tokenizer(
            text, 
            return_tensors="pt", 
            truncation=True, 
            padding=True, 
            max_length=128
        )
        with torch.no_grad():
            logits = model(**inputs).logits
            probs = torch.softmax(logits, dim=-1)
            pred = torch.argmax(logits, dim=-1).item()
            confidence = probs[0][pred].item()
        
        is_toxic = (pred == 0)
        label = "toxic" if is_toxic else "safe"
        
        return jsonify({
            "text": text,
            "prediction": label,
            "confidence": round(confidence, 4),
            "is_toxic": is_toxic
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Run the app (USE PORT 8080 - NOT 5000!)
if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8080, debug=False, threaded=True)