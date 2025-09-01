#!/usr/bin/env python3
"""
Training script for ML models used in the image classification backend.
Generates sample data and trains 5 different models: Decision Tree, Logistic Regression,
Naive Bayes, Random Forest, and SVM.
"""

import os
import numpy as np
import joblib
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import GaussianNB
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, classification_report

# Configuration
IMAGE_SIZE = (28, 28)
MODEL_DIR = "models"
MODEL_CONFIGS = {
    "dt_model.joblib": DecisionTreeClassifier(random_state=42),
    "lr_model.joblib": LogisticRegression(random_state=42, max_iter=1000),
    "nb_model.joblib": GaussianNB(),
    "rf_model.joblib": RandomForestClassifier(n_estimators=100, random_state=42),
    "svm_model.joblib": SVC(kernel='rbf', random_state=42)
}

def generate_sample_data():
    """Generate sample image-like data for training"""
    print("Generating sample dataset...")
    
    # Create sample data that mimics flattened 28x28 images
    n_features = IMAGE_SIZE[0] * IMAGE_SIZE[1]  # 784 features
    n_samples = 5000
    n_classes = 10  # Assuming 10-class classification (like digits)
    
    X, y = make_classification(
        n_samples=n_samples,
        n_features=n_features,
        n_classes=n_classes,
        n_informative=100,
        n_redundant=50,
        n_clusters_per_class=1,
        random_state=42
    )
    
    # Normalize to [0, 1] range like preprocessed images
    X = (X - X.min()) / (X.max() - X.min())
    
    print(f"Dataset shape: {X.shape}")
    print(f"Classes: {np.unique(y)}")
    
    return X, y

def train_and_save_models(X_train, X_test, y_train, y_test):
    """Train all models and save them to disk"""
    print("\nTraining models...")
    
    # Ensure models directory exists
    os.makedirs(MODEL_DIR, exist_ok=True)
    
    results = {}
    
    for model_name, model in MODEL_CONFIGS.items():
        print(f"\nTraining {model_name}...")
        
        # Train the model
        model.fit(X_train, y_train)
        
        # Make predictions
        y_pred = model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        
        # Save the model
        model_path = os.path.join(MODEL_DIR, model_name)
        joblib.dump(model, model_path)
        
        results[model_name] = {
            'accuracy': accuracy,
            'model_type': type(model).__name__
        }
        
        print(f"✓ {model_name} trained with accuracy: {accuracy:.4f}")
        print(f"✓ Model saved to: {model_path}")
    
    return results

def verify_models():
    """Verify that all models can be loaded and make predictions"""
    print("\nVerifying saved models...")
    
    # Generate a small test sample
    test_sample = np.random.rand(1, IMAGE_SIZE[0] * IMAGE_SIZE[1])
    
    for model_name in MODEL_CONFIGS.keys():
        model_path = os.path.join(MODEL_DIR, model_name)
        
        if os.path.exists(model_path):
            try:
                # Load and test the model
                model = joblib.load(model_path)
                prediction = model.predict(test_sample)
                print(f"✓ {model_name}: Loaded successfully, prediction: {prediction[0]}")
            except Exception as e:
                print(f"✗ {model_name}: Error loading - {str(e)}")
        else:
            print(f"✗ {model_name}: File not found")

def main():
    """Main training pipeline"""
    print("=== ML Model Training Pipeline ===")
    
    # Generate sample data
    X, y = generate_sample_data()
    
    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"Training set: {X_train.shape}")
    print(f"Test set: {X_test.shape}")
    
    # Train and save all models
    results = train_and_save_models(X_train, X_test, y_train, y_test)
    
    # Print summary
    print("\n=== Training Summary ===")
    for model_name, metrics in results.items():
        print(f"{model_name}: {metrics['model_type']} - Accuracy: {metrics['accuracy']:.4f}")
    
    # Verify models
    verify_models()
    
    print("\n=== Training Complete ===")
    print(f"All models saved to: {os.path.abspath(MODEL_DIR)}")
    print("Your ML backend is now ready to make predictions!")

if __name__ == "__main__":
    main()
