# api/app.py
from flask import Flask, request, jsonify
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

app = Flask(__name__)

# Load model and tokenizer
MODEL_PATH = "../results/final_model"
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
        
        # Tokenize and predict
        inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=128)
        with torch.no_grad():
            logits = model(**inputs).logits
            probs = torch.softmax(logits, dim=-1)
            pred = torch.argmax(logits, dim=-1).item()
            confidence = probs[0][pred].item()
        
        # In our IMDB proxy: 0 = negative (toxic), 1 = positive (safe)
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

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=False)