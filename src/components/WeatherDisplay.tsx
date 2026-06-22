import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {WeatherData} from '../services/types';
import {colors} from '../theme/colors';

export interface WeatherDisplayProps {
  weather: WeatherData | null;
  loading?: boolean;
  errorText?: string;
}

const WeatherDisplay: React.FC<WeatherDisplayProps> = ({
  weather,
  loading,
  errorText,
}) => {
  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.muted}>Loading…</Text>
      </View>
    );
  }

  if (errorText) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{errorText}</Text>
      </View>
    );
  }

  if (!weather) {
    return (
      <View style={styles.container}>
        <Text style={styles.muted}>Enter a location to see the weather.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.location}>{weather.location}</Text>
      <Text style={styles.temperature}>{Math.round(weather.temperature)}°C</Text>
      <Text style={styles.condition}>{weather.condition}</Text>
      <Text style={styles.source}>via {weather.source}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
  },
  location: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  temperature: {
    fontSize: 48,
    fontWeight: '300',
    color: colors.text,
    marginVertical: 8,
  },
  condition: {
    fontSize: 16,
    color: colors.text,
  },
  source: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
  },
  muted: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  error: {
    fontSize: 14,
    color: colors.error,
  },
});

export default WeatherDisplay;
