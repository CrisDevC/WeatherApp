import React from 'react';
import {StyleSheet, Text, TextInput, View} from 'react-native';

export interface LocationInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  errorText?: string;
}

const LocationInput: React.FC<LocationInputProps> = ({
  value,
  onChangeText,
  onSubmit,
  errorText,
}) => {
  const hasError = Boolean(errorText);

  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, hasError && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        placeholder="🔍  Search city..."
        placeholderTextColor="#8A9BB0"
        autoCorrect={false}
        autoCapitalize="words"
        returnKeyType="search"
        accessibilityLabel="Location input"
        accessibilityHint="Enter a city name and press search"
      />
      {hasError ? (
        <Text style={styles.errorText} accessibilityRole="alert">
          {errorText}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1A2B4A',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#CC3300',
  },
  errorText: {
    marginTop: 6,
    fontSize: 12,
    color: '#CC3300',
    paddingHorizontal: 4,
  },
});

export default LocationInput;
