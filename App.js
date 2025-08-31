import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import LensStyleImagePicker from './components/LensStyleImagePicker';

export default function App() {
  return (
    <View style={styles.container}>
      <LensStyleImagePicker />
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
