
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  Platform,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';
import ConfettiCannon from 'react-native-confetti-cannon';
import MLService from '../services/MLService';

const { width, height } = Dimensions.get('window');

const LensStyleImagePicker = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const [isGalleryVisible, setIsGalleryVisible] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking');
  
  // Animation values
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const imageOpacity = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const gradientPosition = useRef(new Animated.Value(0)).current;
  const floatingAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Check backend health on component mount
    checkBackendHealth();
    
    // Pulse animation for main elements
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Glow animation for the image container
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Gradient position animation
    Animated.loop(
      Animated.timing(gradientPosition, {
        toValue: 1,
        duration: 15000,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    ).start();

    // Floating animation for elements
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatingAnim, {
          toValue: 1,
          duration: 6000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatingAnim, {
          toValue: 0,
          duration: 6000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.03]
  });

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1]
  });

  const floatingTranslateY = floatingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10]
  });

  const glowInterpolation = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1]
  });

  const glowColor = glowAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['rgba(101, 31, 255, 0.2)', 'rgba(101, 31, 255, 0.5)', 'rgba(101, 31, 255, 0.2)']
  });

  const rotation = rotationAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-5deg', '0deg', '5deg']
  });

  const gradientPositionInterpolation = gradientPosition.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%']
  });

  const handleButtonPress = (type) => {
    // Button scale animation with bounce effect
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    if (type === 'camera') {
      setIsCameraVisible(true);
    } else {
      setIsGalleryVisible(true);
    }
  };

  const handleImagePicked = (image) => {
    setSelectedImage(image);
    setShowImage(true);
    
    // Rotation animation when image is selected
    Animated.sequence([
      Animated.spring(rotationAnim, {
        toValue: image.source === 'camera' ? -1 : 1,
        tension: 20,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.spring(rotationAnim, {
        toValue: 0,
        tension: 20,
        friction: 5,
        useNativeDriver: true,
        delay: 300,
      }),
    ]).start();

    // Fade in animation for the image
    Animated.timing(imageOpacity, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  };

  const openCamera = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status === 'granted') {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.cancelled) {
        handleImagePicked({ uri: result.uri, source: 'camera' });
      }
    }
    setIsCameraVisible(false);
  };

  const openGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status === 'granted') {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.cancelled) {
        handleImagePicked({ uri: result.uri, source: 'gallery' });
      }
    }
    setIsGalleryVisible(false);
  };

  const handleProceed = () => {
    if (selectedImage) {
      runMLPrediction(selectedImage.uri);
    }
  };

  const checkBackendHealth = async () => {
    try {
      const health = await MLService.checkBackendHealth();
      setBackendStatus(health.status === 'healthy' ? 'connected' : 'error');
    } catch (error) {
      setBackendStatus('error');
    }
  };

  const runMLPrediction = async (imageUri) => {
    setIsLoading(true);
    setPrediction(null);
    
    try {
      const result = await MLService.uploadImageForPrediction(imageUri);
      setPrediction(result);
      
      // Show success confetti
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
      
      Alert.alert(
        'Prediction Complete! 🎉',
        `Predicted Class: ${result.prediction}\nConfidence: ${(result.confidence * 100).toFixed(1)}%`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Prediction Failed',
        `Error: ${error.message}`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Animated Background Gradient */}
      <LinearGradient
        colors={['#0F0B21', '#1E0F40', '#0F0B21']}
        start={[0, 0]}
        end={[1, 1]}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Animated Gradient Overlay */}
      <Animated.View 
        style={[
          StyleSheet.absoluteFill,
          {
            opacity: 0.3,
            left: gradientPositionInterpolation
          }
        ]}
      >
        <LinearGradient
          colors={['transparent', 'rgba(101, 31, 255, 0.3)', 'transparent']}
          start={[0, 0]}
          end={[1, 0]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Confetti */}
      {showConfetti && (
        <ConfettiCannon
          count={200}
          origin={{ x: width / 2, y: -100 }}
          explosionSpeed={400}
          fallSpeed={3500}
          colors={['#651FFF', '#8C6BFF', '#4A1FC8', '#371A9C']}
          fadeOut={true}
        />
      )}

      <ScrollView contentContainerStyle={styles.content}>
        {/* Title with floating animation */}
        <Animated.Text 
          style={[
            styles.title,
            {
              opacity: pulseOpacity,
              transform: [{ translateY: floatingTranslateY }]
            }
          ]}
        >
          Style Lens
        </Animated.Text>

        <Text style={styles.subtitle}>Upload an image to analyze its style</Text>

        {/* Image Container with Glow Effect */}
        <Animated.View 
          style={[
            styles.imageContainer,
            {
              transform: [{ translateY: floatingTranslateY }]
            }
          ]}
        >
          {/* Glow effect */}
          <Animated.View
            style={[
              styles.glowEffect,
              {
                opacity: glowInterpolation,
                backgroundColor: glowColor,
              }
            ]}
          />
          
          <Animated.View
            style={[
              styles.imageWrapper,
              {
                opacity: imageOpacity,
                transform: [{ rotate: rotation }, { scale: pulseScale }],
              },
            ]}
          >
            {showImage && selectedImage ? (
              <Image
                source={{ uri: selectedImage.uri }}
                style={styles.selectedImage}
              />
            ) : (
              <View style={styles.placeholder}>
                <Animated.Text style={[styles.placeholderIcon, { transform: [{ translateY: floatingTranslateY }] }]}>
                  📷
                </Animated.Text>
                <Text style={styles.placeholderText}>No Image Selected</Text>
              </View>
            )}
          </Animated.View>
        </Animated.View>

        {/* Buttons with animations */}
        <View style={styles.buttonsContainer}>
          <Animated.View style={{ 
            transform: [{ scale: buttonScale }, { translateY: floatingTranslateY }],
            opacity: pulseOpacity
          }}>
            <TouchableOpacity
              style={[styles.button, styles.cameraButton]}
              onPress={() => handleButtonPress('camera')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#651FFF', '#4A1FC8']}
                start={[0, 0]}
                end={[1, 1]}
                style={[StyleSheet.absoluteFill, { borderRadius: 16 }]}
              />
              <Text style={styles.buttonText}>📷 Open Camera</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ 
            transform: [{ scale: buttonScale }, { translateY: floatingTranslateY }],
            opacity: pulseOpacity
          }}>
            <TouchableOpacity
              style={[styles.button, styles.galleryButton]}
              onPress={() => handleButtonPress('gallery')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#8C6BFF', '#651FFF']}
                start={[0, 0]}
                end={[1, 1]}
                style={[StyleSheet.absoluteFill, { borderRadius: 16 }]}
              />
              <Text style={styles.buttonText}>🖼️ Choose from Gallery</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Proceed Button */}
        {selectedImage && (
          <Animated.View
            style={[
              styles.proceedContainer,
              {
                transform: [{ scale: buttonScale }, { translateY: floatingTranslateY }],
                opacity: pulseOpacity
              },
            ]}
          >
            <TouchableOpacity
              style={styles.proceedButton}
              onPress={handleProceed}
              activeOpacity={0.7}
              disabled={isLoading}
            >
              <LinearGradient
                colors={['#00C853', '#009624']}
                start={[0, 0]}
                end={[1, 1]}
                style={[StyleSheet.absoluteFill, { borderRadius: 16 }]}
              />
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.proceedButtonText}>Analyze Style →</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Backend Status Indicator */}
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusIndicator, 
            { backgroundColor: backendStatus === 'connected' ? '#4CAF50' : backendStatus === 'checking' ? '#FFC107' : '#F44336' }
          ]} />
          <Text style={styles.statusText}>
            {backendStatus === 'connected' ? 'Connected to ML Service' : 
             backendStatus === 'checking' ? 'Checking connection...' : 
             'Connection failed. Please check your network.'}
          </Text>
        </View>
      </ScrollView>

      {/* Camera Modal */}
      <Modal visible={isCameraVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Camera style={StyleSheet.absoluteFill} />
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={openCamera}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setIsCameraVisible(false)}
            >
              <Text style={styles.closeModalButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Gallery Modal */}
      <Modal visible={isGalleryVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#0F0B21', '#1E0F40']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select from Gallery</Text>
            <TouchableOpacity
              style={styles.galleryButtonModal}
              onPress={openGallery}
            >
              <Text style={styles.galleryButtonText}>Choose Image</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setIsGalleryVisible(false)}
            >
              <Text style={styles.closeModalButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0B21',
    overflow: 'hidden',
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 40,
    textAlign: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
    position: 'relative',
  },
  glowEffect: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  imageWrapper: {
    width: 260,
    height: 260,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'rgba(101, 31, 255, 0.3)',
    elevation: 8,
    shadowColor: '#651FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: {
    fontSize: 50,
    marginBottom: 15,
  },
  placeholderText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 16,
  },
  buttonsContainer: {
    width: '100%',
    gap: 16,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  button: {
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  proceedContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  proceedButton: {
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  proceedButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  statusText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 30,
  },
  modalButtons: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  galleryButtonModal: {
    backgroundColor: 'rgba(101, 31, 255, 0.9)',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  galleryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  closeModalButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeModalButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default LensStyleImagePicker;