from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import numpy as np
import joblib
import tensorflow as tf
from collections import Counter
from werkzeug.utils import secure_filename
import tempfile
import uuid

app = Flask(__name__)
CORS(app)  # Enable CORS for React Native

# Configuration
IMAGE_SIZE = (28, 28)
MODEL_DIR = "models"
MODEL_NAMES = [
    "dt_model.joblib", "lr_model.joblib", "nb_model.joblib",
    "rf_model.joblib", "svm_model.joblib"
]
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

# Create directories if they don't exist
os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def preprocess_image(img_path: str):
    """Preprocess image for ML model inference"""
    try:
        img = tf.keras.preprocessing.image.load_img(
            img_path, target_size=IMAGE_SIZE, color_mode="grayscale")
        arr = tf.keras.preprocessing.image.img_to_array(img) / 255.0
        return arr.flatten().reshape(1, -1)
    except Exception as e:
        raise Exception(f"Error preprocessing image: {str(e)}")

def run_inference(image_path: str) -> dict:
    """Run ML inference on the image"""
    try:
        x = preprocess_image(image_path)
        preds = []
        model_predictions = {}
        
        for name in MODEL_NAMES:
            path = os.path.join(MODEL_DIR, name)
            if os.path.exists(path):
                model = joblib.load(path)
                pred = int(model.predict(x)[0])
                preds.append(pred)
                model_predictions[name.replace('.joblib', '')] = pred
            else:
                print(f"Warning: Model {name} not found")
        
        if not preds:
            return {"error": "No models found for inference"}
        
        # Majority vote
        most_common = Counter(preds).most_common(1)[0][0]
        confidence = Counter(preds).most_common(1)[0][1] / len(preds)
        
        return {
            "prediction": most_common,
            "confidence": confidence,
            "individual_predictions": model_predictions,
            "all_predictions": preds
        }
    except Exception as e:
        return {"error": f"Inference failed: {str(e)}"}

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "message": "ML Backend is running"})

@app.route('/predict', methods=['POST'])
def predict():
    """Main prediction endpoint"""
    try:
        # Check if image file is present
        if 'image' not in request.files:
            return jsonify({"error": "No image file provided"}), 400
        
        file = request.files['image']
        
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        if not allowed_file(file.filename):
            return jsonify({"error": "Invalid file type. Allowed: png, jpg, jpeg, gif"}), 400
        
        # Save uploaded file temporarily
        filename = secure_filename(f"{uuid.uuid4()}_{file.filename}")
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        
        try:
            # Run inference
            result = run_inference(filepath)
            
            # Clean up uploaded file
            os.remove(filepath)
            
            if "error" in result:
                return jsonify(result), 500
            
            return jsonify({
                "success": True,
                "prediction": result["prediction"],
                "confidence": result["confidence"],
                "details": result["individual_predictions"],
                "message": f"Predicted class: {result['prediction']} with {result['confidence']:.2%} confidence"
            })
            
        except Exception as e:
            # Clean up file even if inference fails
            if os.path.exists(filepath):
                os.remove(filepath)
            return jsonify({"error": f"Prediction failed: {str(e)}"}), 500
            
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route('/models/status', methods=['GET'])
def models_status():
    """Check which models are available"""
    available_models = []
    missing_models = []
    
    for name in MODEL_NAMES:
        path = os.path.join(MODEL_DIR, name)
        if os.path.exists(path):
            available_models.append(name)
        else:
            missing_models.append(name)
    
    return jsonify({
        "available_models": available_models,
        "missing_models": missing_models,
        "total_models": len(MODEL_NAMES),
        "available_count": len(available_models)
    })

if __name__ == '__main__':
    print("Starting ML Backend Server...")
    print(f"Models directory: {MODEL_DIR}")
    print(f"Upload directory: {UPLOAD_FOLDER}")
    
    # Check model availability
    available = sum(1 for name in MODEL_NAMES if os.path.exists(os.path.join(MODEL_DIR, name)))
    print(f"Available models: {available}/{len(MODEL_NAMES)}")
    
    app.run(host='0.0.0.0', port=5001, debug=True)
