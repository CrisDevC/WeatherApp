import React from 'react';
import {SafeAreaView, StatusBar, StyleSheet} from 'react-native';
import WeatherScreen from './src/screens/WeatherScreen';

const App: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <WeatherScreen />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
