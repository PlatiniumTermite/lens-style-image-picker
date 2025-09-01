#!/usr/bin/env python3
"""
Test script to verify all ML models are working without starting the full Flask server.
"""

import os
import numpy as np
import joblib

# Configuration
IMAGE_SIZE = (28, 28)
MODEL_DIR = "models"
MODEL_NAMES = [
    "dt_model.joblib", "lr_model.joblib", "nb_model.joblib",
    "rf_model.joblib", "svm_model.joblib"
]

def test_models():
    """Test all models to ensure they're working"""
    print("=== Testing ML Models ===")
    
    # Generate a test sample (flattened 28x28 image)
    test_sample = np.random.rand(1, IMAGE_SIZE[0] * IMAGE_SIZE[1])
    
    available_models = []
    missing_models = []
    working_models = []
    broken_models = []
    
    for model_name in MODEL_NAMES:
        model_path = os.path.join(MODEL_DIR, model_name)
        
        if os.path.exists(model_path):
            available_models.append(model_name)
            try:
                # Load and test the model
                model = joblib.load(model_path)
                prediction = model.predict(test_sample)
                confidence = getattr(model, 'predict_proba', lambda x: [[0.5] * 10])(test_sample)
                
                working_models.append(model_name)
                print(f"✓ {model_name}: Working - Prediction: {prediction[0]}")
                
            except Exception as e:
                broken_models.append(model_name)
                print(f"✗ {model_name}: Error - {str(e)}")
        else:
            missing_models.append(model_name)
            print(f"✗ {model_name}: File not found")
    
    # Summary
    print(f"\n=== Model Status Summary ===")
    print(f"Total models: {len(MODEL_NAMES)}")
    print(f"Available: {len(available_models)}")
    print(f"Working: {len(working_models)}")
    print(f"Missing: {len(missing_models)}")
    print(f"Broken: {len(broken_models)}")
    
    if working_models:
        print(f"\n✓ Working models: {', '.join(working_models)}")
    if missing_models:
        print(f"\n✗ Missing models: {', '.join(missing_models)}")
    if broken_models:
        print(f"\n✗ Broken models: {', '.join(broken_models)}")
    
    return {
        "total": len(MODEL_NAMES),
        "working": len(working_models),
        "missing": len(missing_models),
        "broken": len(broken_models),
        "all_working": len(working_models) == len(MODEL_NAMES)
    }

if __name__ == "__main__":
    results = test_models()
    
    if results["all_working"]:
        print("\n🎉 All models are working correctly!")
    else:
        print(f"\n⚠️  {results['working']}/{results['total']} models are working")
