import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet, Text, View} from 'react-native';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({onFinish}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.sequence([
      // Fade + scale in
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 6,
          useNativeDriver: true,
        }),
      ]),
      // Hold
      Animated.delay(1000),
      // Fade out
      Animated.timing(opacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => onFinish());
  }, [opacity, scale, onFinish]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, {opacity, transform: [{scale}]}]}>
        <Text style={styles.emoji}>🌤️</Text>
        <Text style={styles.appName}>WeatherApp</Text>
        <Text style={styles.tagline}>Your weather, your way</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EBF0F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    gap: 8,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 8,
  },
  appName: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1A2B4A',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 16,
    color: '#8A9BB0',
    marginTop: 4,
  },
});

export default SplashScreen;
