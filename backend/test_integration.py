#!/usr/bin/env python3
"""
Integration test script to verify the complete frontend-backend connection.
Tests all API endpoints and model functionality.
"""

import requests
import json
import os
from io import BytesIO
from PIL import Image
import numpy as np

API_BASE_URL = 'http://localhost:5001'

def test_health_endpoint():
    """Test the health check endpoint"""
    try:
        response = requests.get(f'{API_BASE_URL}/health')
        data = response.json()
        print(f"✓ Health Check: {data['status']} - {data['message']}")
        return True
    except Exception as e:
        print(f"✗ Health Check Failed: {str(e)}")
        return False

def test_models_status():
    """Test the models status endpoint"""
    try:
        response = requests.get(f'{API_BASE_URL}/models/status')
        data = response.json()
        print(f"✓ Models Status: {data['available_count']}/{data['total_models']} models available")
        print(f"  Available: {', '.join(data['available_models'])}")
        return True
    except Exception as e:
        print(f"✗ Models Status Failed: {str(e)}")
        return False

def create_test_image():
    """Create a test image for prediction testing"""
    # Create a simple 28x28 test image
    img_array = np.random.randint(0, 255, (28, 28, 3), dtype=np.uint8)
    img = Image.fromarray(img_array)
    
    # Save to temporary file
    test_image_path = 'test_image.png'
    img.save(test_image_path)
    return test_image_path

def test_prediction_endpoint():
    """Test the prediction endpoint with a sample image"""
    try:
        # Create test image
        test_image_path = create_test_image()
        
        # Upload image for prediction
        with open(test_image_path, 'rb') as f:
            files = {'image': ('test_image.png', f, 'image/png')}
            response = requests.post(f'{API_BASE_URL}/predict', files=files)
        
        # Clean up test image
        os.remove(test_image_path)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Prediction Endpoint: Success")
            print(f"  Prediction: {data['prediction']}")
            print(f"  Confidence: {data['confidence']:.2%}")
            print(f"  Models used: {len(data['details'])} models")
            return True
        else:
            print(f"✗ Prediction Failed: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"✗ Prediction Test Failed: {str(e)}")
        return False

def main():
    """Run all integration tests"""
    print("=== Frontend-Backend Integration Test ===\n")
    
    tests = [
        ("Backend Health", test_health_endpoint),
        ("Models Status", test_models_status),
        ("Prediction API", test_prediction_endpoint)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"Testing {test_name}...")
        if test_func():
            passed += 1
        print()
    
    print("=== Integration Test Summary ===")
    print(f"Tests Passed: {passed}/{total}")
    
    if passed == total:
        print("🎉 All integration tests passed! Your frontend-backend connection is working perfectly.")
        print("\nYour app is ready to use:")
        print("• Backend: http://localhost:5001")
        print("• Frontend: Scan QR code with Expo Go")
        print("• Web version: Available through Expo web interface")
    else:
        print("⚠️ Some tests failed. Please check the backend server and try again.")

if __name__ == "__main__":
    main()
