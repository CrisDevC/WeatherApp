import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import LocationInput from '../components/LocationInput';
import ServiceToggle from '../components/ServiceToggle';
import WeatherDisplay from '../components/WeatherDisplay';
import {SERVICE_NAMES} from '../services/serviceRegistry';
import {useWeatherStore} from '../store/useWeatherStore';
import {getServiceTheme, colors} from '../theme/colors';

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

  const theme = getServiceTheme(selectedServiceName);

  /**
   * Only show the error in the location input if it looks like a validation
   * error (i.e. there's no weather data yet and the error came from validate).
   * Network/service errors go to WeatherDisplay instead.
   */
  const isValidationError =
    error !== null && !loading && weather === null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled">

      {/* Header band — colour changes with service selection */}
      <View style={[styles.header, {backgroundColor: theme.headerBackground}]}>
        <Text style={[styles.headerTitle, {color: theme.accent}]}>
          Weather
        </Text>
        <Text style={styles.headerSubtitle}>via {selectedServiceName}</Text>
      </View>

      <View style={styles.section}>
        <LocationInput
          value={locationText}
          onChangeText={setLocationText}
          onSubmit={fetchWeather}
          errorText={isValidationError ? error ?? undefined : undefined}
        />
      </View>

      <View style={styles.section}>
        <ServiceToggle
          options={SERVICE_NAMES}
          selected={selectedServiceName}
          onSelect={selectService}
        />
      </View>

      <View style={styles.section}>
        <WeatherDisplay
          weather={weather}
          loading={loading}
          errorText={!isValidationError && error ? error : undefined}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  section: {
    marginBottom: 16,
  },
});

export default WeatherScreen;
