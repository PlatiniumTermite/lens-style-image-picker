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
  const backgroundAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const imageOpacity = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const particlesAnim = useRef(new Animated.Value(0)).current;
  const gradientShift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Check backend health on component mount
    checkBackendHealth();
    
    // Enhanced pulse animation with more fluid movement
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Background animation with gradient shift
    Animated.loop(
      Animated.sequence([
        Animated.timing(backgroundAnim, {
          toValue: 1,
          duration: 10000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(backgroundAnim, {
          toValue: 0,
          duration: 10000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    ).start();

    // Glow animation for the image container
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Particles floating animation
    Animated.loop(
      Animated.timing(particlesAnim, {
        toValue: 1,
        duration: 15000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Gradient position animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(gradientShift, {
          toValue: 1,
          duration: 8000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(gradientShift, {
          toValue: 0,
          duration: 8000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.9, 1.1, 0.9]
  });

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.4, 0.8, 0.4]
  });

  const backgroundInterpolation = backgroundAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const glowInterpolation = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1]
  });

  const glowColor = glowAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['rgba(138, 43, 226, 0.3)', 'rgba(75, 0, 130, 0.6)', 'rgba(138, 43, 226, 0.3)']
  });

  const rotation = rotationAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-8deg', '0deg', '8deg']
  });

  const particlesTranslateY = particlesAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -100]
  });

  const gradientPosition = gradientShift.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width]
  });

  const handleButtonPress = (type) => {
    // Enhanced button scale animation with bounce effect
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.9,
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
    
    // Enhanced rotation animation with more dynamic movement
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

    // Enhanced fade in animation with slight scaling
    Animated.parallel([
      Animated.timing(imageOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(pulseAnim, {
        toValue: 1,
        tension: 10,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
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

  const renderParticles = () => {
    return Array.from({ length: 20 }).map((_, index) => {
      const size = Math.random() * 8 + 2;
      const animValue = new Animated.Value(0);
      
      // Individual particle animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: 1,
            duration: 3000 + Math.random() * 4000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
            delay: index * 200,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 3000 + Math.random() * 4000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
      
      const opacity = animValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.1, 0.4]
      });
      
      const translateY = animValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -50 - Math.random() * 100]
      });
      
      const translateX = animValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, (Math.random() - 0.5) * 100]
      });
      
      return (
        <Animated.View
          key={index}
          style={[
            styles.particle,
            {
              top: Math.random() * height,
              left: Math.random() * width,
              width: size,
              height: size,
              opacity,
              transform: [{ translateY }, { translateX }],
              backgroundColor: index % 3 === 0 
                ? 'rgba(138, 43, 226, 0.6)' 
                : index % 3 === 1 
                  ? 'rgba(0, 0, 255, 0.6)' 
                  : 'rgba(255, 255, 255, 0.4)',
            },
          ]}
        />
      );
    });
  };

  const renderRings = () => {
    return Array.from({ length: 4 }).map((_, index) => {
      const size = 340 - index * 30;
      const delay = index * 400;
      
      // Individual ring animation
      const ringAnim = new Animated.Value(0);
      
      Animated.loop(
        Animated.sequence([
          Animated.timing(ringAnim, {
            toValue: 1,
            duration: 3000 + index * 1000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
            delay,
          }),
          Animated.timing(ringAnim, {
            toValue: 0,
            duration: 3000 + index * 1000,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
      
      const ringScale = ringAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.8, 1.2]
      });
      
      const ringOpacity = ringAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.2, 0.6]
      });
      
      return (
        <Animated.View
          key={index}
          style={[
            styles.ring,
            {
              width: size,
              height: size,
              borderWidth: index === 0 ? 3 : index === 1 ? 2 : 1,
              opacity: ringOpacity,
              transform: [{ scale: ringScale }],
              borderColor: index % 2 === 0 
                ? 'rgba(138, 43, 226, 0.6)' 
                : 'rgba(0, 0, 255, 0.6)',
            },
          ]}
        />
      );
    });
  };

  return (
    <View style={styles.container}>
      {/* Enhanced Background Gradient with Animation */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            transform: [
              {
                rotate: backgroundInterpolation,
              },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={['rgba(0, 0, 100, 0.9)', 'rgba(75, 0, 130, 0.9)', 'rgba(0, 0, 50, 1)']}
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
              transform: [{
                translateX: gradientPosition
              }]
            }
          ]}
        >
          <LinearGradient
            colors={['transparent', 'rgba(138, 43, 226, 0.4)', 'transparent']}
            start={[0, 0]}
            end={[1, 0]}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </Animated.View>

      {/* Enhanced Particles */}
      {renderParticles()}

      {/* Confetti */}
      {showConfetti && (
        <ConfettiCannon
          count={300}
          origin={{ x: width / 2, y: -100 }}
          explosionSpeed={400}
          fallSpeed={3500}
          colors={['#4b0082', '#0000ff', '#8a2be2', '#9370db', '#7b68ee', '#6a5acd']}
          fadeOut={true}
        />
      )}

      <ScrollView contentContainerStyle={styles.content}>
        {/* Title with subtle animation */}
        <Animated.Text 
          style={[
            styles.title,
            {
              opacity: pulseAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1]
              }),
              transform: [{
                translateY: pulseAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 3]
                })
              }]
            }
          ]}
        >
          Choose Image
        </Animated.Text>

        {/* Image Container with Enhanced Rings and Glow */}
        <View style={styles.imageContainer}>
          {renderRings()}
          
          {/* Glow effect */}
          <Animated.View
            style={[
              styles.glowEffect,
              {
                opacity: glowInterpolation,
                backgroundColor: glowColor,
                transform: [{ scale: pulseScale }]
              }
            ]}
          />
          
          <Animated.View
            style={[
              styles.imageWrapper,
              {
                opacity: imageOpacity,
                transform: [{ rotate: rotation }, { scale: pulseScale }],
                shadowOpacity: glowInterpolation,
                shadowRadius: 20,
                shadowColor: '#8a2be2',
                shadowOffset: { width: 0, height: 0 },
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
                <Text style={styles.placeholderIcon}>📷</Text>
                <Text style={styles.placeholderText}>No Image Selected</Text>
              </View>
            )}
          </Animated.View>
        </View>

        {/* Buttons with enhanced animations */}
        <View style={styles.buttonsContainer}>
          <Animated.View style={{ 
            transform: [{ scale: buttonScale }],
            opacity: pulseAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.9, 1]
            })
          }}>
            <TouchableOpacity
              style={[styles.button, styles.cameraButton]}
              onPress={() => handleButtonPress('camera')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['rgba(0, 0, 255, 0.8)', 'rgba(75, 0, 130, 0.9)']}
                start={[0, 0]}
                end={[1, 1]}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.buttonText}>📷 Open Camera</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ 
            transform: [{ scale: buttonScale }],
            opacity: pulseAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.9, 1]
            })
          }}>
            <TouchableOpacity
              style={[styles.button, styles.galleryButton]}
              onPress={() => handleButtonPress('gallery')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['rgba(128, 0, 128, 0.8)', 'rgba(75, 0, 130, 0.9)']}
                start={[0, 0]}
                end={[1, 1]}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.buttonText}>🖼️ Choose from Gallery</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Proceed Button with enhanced animation */}
        {selectedImage && (
          <Animated.View
            style={[
              styles.proceedContainer,
              {
                transform: [{ scale: buttonScale }],
                opacity: pulseAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.9, 1]
                })
              },
            ]}
          >
            <TouchableOpacity
              style={styles.proceedButton}
              onPress={handleProceed}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['rgba(0, 128, 0, 0.8)', 'rgba(0, 100, 0, 0.9)']}
                start={[0, 0]}
                end={[1, 1]}
                style={[StyleSheet.absoluteFill, { borderRadius: 16 }]}
              />
              <Text style={styles.proceedButtonText}>Proceed →</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>

      {/* Camera Modal */}
      <Modal visible={isCameraVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Camera style={StyleSheet.absoluteFill} />
          <TouchableOpacity
            style={styles.captureButton}
            onPress={openCamera}
          >
            <Text style={styles.captureButtonText}>Capture</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsCameraVisible(false)}
          >
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Gallery Modal */}
      <Modal visible={isGalleryVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.galleryButtonModal}
            onPress={openGallery}
          >
            <Text style={styles.galleryButtonText}>Select from Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsGalleryVisible(false)}
          >
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 38,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 40,
    textShadowColor: 'rgba(138, 43, 226, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
    position: 'relative',
  },
  glowEffect: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
  },
  ring: {
    position: 'absolute',
    borderRadius: 200,
    borderWidth: 1,
  },
  imageWrapper: {
    width: 280,
    height: 280,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 2,
    borderColor: 'rgba(138, 43, 226, 0.3)',
    elevation: 10,
    shadowColor: '#8a2be2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
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
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
  },
  buttonsContainer: {
    width: '100%',
    gap: 20,
    paddingHorizontal: 30,
  },
  button: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
    overflow: 'hidden',
  },
  cameraButton: {
    backgroundColor: 'transparent',
  },
  galleryButton: {
    backgroundColor: 'transparent',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  proceedContainer: {
    width: '100%',
    paddingHorizontal: 40,
    marginTop: 20,
    marginBottom: 50,
  },
  proceedButton: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
    overflow: 'hidden',
  },
  proceedButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  particle: {
    position: 'absolute',
    borderRadius: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    position: 'absolute',
    bottom: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 20,
    borderRadius: 30,
  },
  captureButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  galleryButtonModal: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 20,
    borderRadius: 30,
  },
  galleryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default LensStyleImagePicker;