import React from 'react';
import {ActivityIndicator, ScrollView, StyleSheet, Text, View} from 'react-native';
import {WeatherData} from '../services/types';

export function conditionToEmoji(condition: string): string {
  const c = condition.toLowerCase();
  if (c.includes('clear')) return '☀️';
  if (c.includes('mainly clear')) return '🌤️';
  if (c.includes('partly cloudy')) return '⛅';
  if (c.includes('overcast') || c.includes('cloudy') || c.includes('clouds')) return '☁️';
  if (c.includes('drizzle')) return '🌦️';
  if (c.includes('freezing')) return '🌨️';
  if (c.includes('thunder') || c.includes('storm')) return '⛈️';
  if (c.includes('snow') || c.includes('sleet')) return '❄️';
  if (c.includes('shower') || c.includes('rain')) return '🌧️';
  if (c.includes('fog') || c.includes('mist')) return '🌫️';
  if (c.includes('wind')) return '💨';
  return '🌡️';
}

export interface WeatherDisplayProps {
  weather: WeatherData | null;
  loading?: boolean;
  errorText?: string;
}

const WeatherDisplay: React.FC<WeatherDisplayProps> = ({weather, loading, errorText}) => {
  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#5B8CCC" />
        <Text style={styles.mutedText}>Fetching weather…</Text>
      </View>
    );
  }

  if (errorText) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorEmoji}>⚠️</Text>
        <Text style={styles.errorText}>{errorText}</Text>
      </View>
    );
  }

  if (!weather) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.placeholderEmoji}>🔍</Text>
        <Text style={styles.mutedText}>Enter a city to see the weather</Text>
      </View>
    );
  }

  const emoji = conditionToEmoji(weather.condition);
  const tomorrow = weather.forecast?.[1];

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}>

      {/* City + Today */}
      <Text style={styles.location}>{weather.location}</Text>
      <Text style={styles.today}>Today</Text>

      {/* Main weather */}
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.temperature}>{Math.round(weather.temperature)}°C</Text>
      <Text style={styles.condition}>{weather.condition}</Text>

      {/* Tomorrow row */}
      {tomorrow ? (
        <View style={styles.tomorrowRow}>
          <Text style={styles.tomorrowLabel}>Tomorrow</Text>
          <Text style={styles.tomorrowEmoji}>{conditionToEmoji(tomorrow.condition)}</Text>
          <Text style={styles.tomorrowTemp}>{tomorrow.tempMax}° / {tomorrow.tempMin}°</Text>
        </View>
      ) : null}

      {/* 7-day forecast */}
      {weather.forecast && weather.forecast.length > 2 ? (
        <View style={styles.forecastRow}>
          {weather.forecast.slice(0, 7).map((day, i) => (
            <View key={i} style={styles.forecastDay}>
              <Text style={styles.forecastDayLabel}>{i === 0 ? 'Now' : day.day.slice(0, 1)}</Text>
              <Text style={styles.forecastEmoji}>{conditionToEmoji(day.condition)}</Text>
              <Text style={styles.forecastTemp}>{day.tempMax}°</Text>
            </View>
          ))}
        </View>
      ) : null}

      <Text style={styles.source}>via {weather.source}</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  container: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  centeredContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  location: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A2B4A',
    textAlign: 'center',
  },
  today: {
    fontSize: 14,
    color: '#8A9BB0',
    marginTop: 4,
    marginBottom: 8,
  },
  emoji: {
    fontSize: 80,
    marginVertical: 12,
  },
  temperature: {
    fontSize: 72,
    fontWeight: '200',
    color: '#1A2B4A',
    letterSpacing: -2,
  },
  condition: {
    fontSize: 17,
    color: '#4A6080',
    marginTop: 6,
  },
  tomorrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tomorrowLabel: {
    flex: 1,
    fontSize: 15,
    color: '#4A6080',
    fontWeight: '500',
  },
  tomorrowEmoji: {
    fontSize: 22,
  },
  tomorrowTemp: {
    fontSize: 15,
    color: '#1A2B4A',
    fontWeight: '600',
    marginLeft: 8,
  },
  forecastRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  forecastDay: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  forecastDayLabel: {
    fontSize: 12,
    color: '#8A9BB0',
    fontWeight: '500',
  },
  forecastEmoji: {
    fontSize: 18,
  },
  forecastTemp: {
    fontSize: 13,
    color: '#1A2B4A',
    fontWeight: '600',
  },
  source: {
    fontSize: 12,
    color: '#8A9BB0',
    marginTop: 16,
  },
  placeholderEmoji: {
    fontSize: 48,
  },
  errorEmoji: {
    fontSize: 40,
  },
  errorText: {
    fontSize: 14,
    color: '#CC3300',
    textAlign: 'center',
  },
  mutedText: {
    fontSize: 14,
    color: '#8A9BB0',
    textAlign: 'center',
  },
});

export default WeatherDisplay;
