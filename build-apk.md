# Build APK Guide

## Method 1: Using EAS Build (Recommended)

### 1. Install EAS CLI
```bash
npm install -g eas-cli
```

### 2. Login to Expo
```bash
eas login
```

### 3. Configure Project
```bash
eas build:configure
```

### 4. Build APK
```bash
# For preview/testing
eas build --platform android --profile preview

# For production
eas build --platform android --profile production
```

## Method 2: Using Expo Build (Legacy)

### 1. Install Expo CLI
```bash
npm install -g @expo/cli
```

### 2. Build APK
```bash
npx expo build:android -t apk
```

## Method 3: Local Build with React Native CLI

### 1. Eject from Expo (if needed)
```bash
npx expo eject
```

### 2. Generate Debug APK
```bash
cd android
./gradlew assembleDebug
```

### 3. Generate Release APK
```bash
cd android
./gradlew assembleRelease
```

## Method 4: Simple Expo Development Build

### 1. Create development build
```bash
npx expo install expo-dev-client
npx expo run:android
```

## Important Notes

### Backend Configuration
- Update `MLService.js` with your production backend URL
- Deploy your Python Flask backend to a cloud service (Heroku, AWS, etc.)

### APK Location
- EAS Build: Download from Expo dashboard
- Local Build: `android/app/build/outputs/apk/`

### Testing
1. Install APK on Android device
2. Test camera/gallery functionality
3. Verify ML predictions work with backend

## Quick Commands

```bash
# Install dependencies
npm install

# Start development
npx expo start

# Build preview APK (corrected)
npm install -g eas-cli
eas build --platform android --profile preview

# Check build status
eas build:list
```
