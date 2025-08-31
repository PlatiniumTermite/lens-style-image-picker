const API_BASE_URL = 'http://localhost:5000'; // Change this to your backend URL

class MLService {
  static async uploadImageForPrediction(imageUri) {
    try {
      const formData = new FormData();
      
      // Create file object from image URI
      const filename = imageUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      
      formData.append('image', {
        uri: imageUri,
        type: type,
        name: filename || 'image.jpg',
      });

      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Prediction failed');
      }

      return result;
    } catch (error) {
      console.error('ML Service Error:', error);
      throw error;
    }
  }

  static async checkBackendHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Backend health check failed:', error);
      return { status: 'error', message: 'Backend not reachable' };
    }
  }

  static async getModelsStatus() {
    try {
      const response = await fetch(`${API_BASE_URL}/models/status`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Models status check failed:', error);
      return { error: 'Could not check models status' };
    }
  }
}

export default MLService;
