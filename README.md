# Lens Style Image Picker

A beautiful React Native app with a lens-style image picker featuring stunning animations, camera integration, and gallery selection.

## Features

- **Animated UI**: Smooth pulse animations, rotating backgrounds, and particle effects
- **Camera Integration**: Take photos directly from the camera
- **Gallery Selection**: Choose images from device gallery
- **Confetti Celebration**: Fun confetti animation when proceeding
- **Modern Design**: Gradient backgrounds with glass-morphism effects
- **Cross-Platform**: Works on iOS and Android

## Prerequisites

- Node.js (v14 or higher)
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for iOS development)
- Android Studio/Emulator (for Android development)

## Installation

1. **Clone or download the project**
   ```bash
   cd "project app"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device/simulator**
   - For iOS: `npm run ios`
   - For Android: `npm run android`
   - For Web: `npm run web`

## Project Structure

```
project app/
├── App.js                           # Main app entry point
├── components/
│   └── LensStyleImagePicker.js      # Main image picker component
├── package.json                     # Dependencies and scripts
├── app.json                         # Expo configuration
└── README.md                        # This file
```

## Dependencies

- **expo**: Expo framework
- **react-native**: React Native framework
- **expo-linear-gradient**: Gradient backgrounds
- **expo-image-picker**: Image selection from gallery/camera
- **expo-camera**: Camera functionality
- **react-native-confetti-cannon**: Confetti animations

## Permissions

The app requires the following permissions:
- **Camera**: To take photos
- **Photo Library**: To select images from gallery

These permissions are automatically requested when needed.

## Usage

1. Launch the app
2. Tap "📷 Open Camera" to take a new photo
3. Tap "🖼️ Choose from Gallery" to select an existing image
4. Once an image is selected, tap "Proceed →" to celebrate with confetti!

## Customization

You can customize the app by modifying:
- Colors in the `styles` object in `LensStyleImagePicker.js`
- Animation durations and effects in the `useEffect` hooks
- Button text and emojis
- Confetti colors and effects

## Troubleshooting

**Camera not working?**
- Ensure camera permissions are granted
- Test on a physical device (camera doesn't work in simulators)

**Gallery not accessible?**
- Check photo library permissions
- Ensure the device has images in the gallery

**App crashes on startup?**
- Run `npm install` to ensure all dependencies are installed
- Clear Expo cache: `expo start -c`

## Development

To modify the app:
1. Edit files in the project
2. The app will automatically reload with changes
3. Use Expo DevTools for debugging

## Building for Production

To build the app for production:
```bash
expo build:ios    # For iOS
expo build:android # For Android
```

## License

This project is open source and available under the MIT License.
