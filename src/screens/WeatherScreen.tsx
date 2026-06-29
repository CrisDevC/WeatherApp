import React from 'react';
import {KeyboardAvoidingView, Platform, StyleSheet, Text, View} from 'react-native';
import LocationInput from '../components/LocationInput';
import ServiceToggle from '../components/ServiceToggle';
import WeatherDisplay from '../components/WeatherDisplay';
import {SERVICE_NAMES} from '../services/serviceRegistry';
import {useWeatherStore} from '../store/useWeatherStore';

const WeatherScreen: React.FC = () => {
  const {
    locationText,
    selectedServiceName,
    weather,
    loading,
    error,
    setLocationText,
    selectService,
    fetchWeather,
  } = useWeatherStore();

  const isValidationError = error !== null && !loading && weather === null;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

      {/* Navbar */}
      <View style={styles.topControls}>
        <View style={styles.navbar}>
          <Text style={styles.navTitle}>🌤️ WeatherApp</Text>
        </View>
        <LocationInput
          value={locationText}
          onChangeText={setLocationText}
          onSubmit={fetchWeather}
          errorText={isValidationError ? error ?? undefined : undefined}
        />
        <ServiceToggle
          options={SERVICE_NAMES}
          selected={selectedServiceName}
          onSelect={selectService}
        />
      </View>

      {/* Weather takes the rest of the screen */}
      <View style={styles.weatherArea}>
        <WeatherDisplay
          weather={weather}
          loading={loading}
          errorText={!isValidationError && error ? error : undefined}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EBF0F7',
  },
  topControls: {
    paddingTop: 16,
    paddingBottom: 12,
    gap: 10,
    backgroundColor: '#EBF0F7',
    borderBottomWidth: 1,
    borderBottomColor: '#D8E2EE',
    marginBottom: 8,
  },
  weatherArea: {
    flex: 1,
  },
  navbar: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  navTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A2B4A',
  },
});

export default WeatherScreen;
