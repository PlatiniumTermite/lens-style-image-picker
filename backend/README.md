# ML Backend Server

Python Flask backend for machine learning image classification with React Native frontend integration.

## Setup Instructions

### 1. Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Create Models Directory
```bash
mkdir models
# Place your trained ML models (.joblib files) in this directory:
# - dt_model.joblib
# - lr_model.joblib  
# - nb_model.joblib
# - rf_model.joblib
# - svm_model.joblib
```

### 3. Start Backend Server
```bash
python app.py
```

The server will start on `http://localhost:5000`

## API Endpoints

### Health Check
- **GET** `/health`
- Returns server status

### Image Prediction
- **POST** `/predict`
- Upload image file for ML classification
- Returns prediction with confidence score

### Models Status
- **GET** `/models/status`
- Check which ML models are available

## Model Setup Instructions
The backend expects 5 trained ML models in the `models/` directory:
- `dt_model.joblib` - Decision Tree Classifier
- `lr_model.joblib` - Logistic Regression
- `nb_model.joblib` - Naive Bayes
- `rf_model.joblib` - Random Forest Classifier  
- `svm_model.joblib` - Support Vector Machine

## Frontend Integration

The React Native app automatically connects to the backend when you:
1. Select an image from camera or gallery
2. Press "Analyze Image" button
3. View ML prediction results

## File Structure
```
backend/
├── app.py              # Main Flask server
├── requirements.txt    # Python dependencies
├── models/            # ML model files (.joblib)
├── uploads/           # Temporary image uploads
└── README.md          # This file
```
