import React from 'react';
import {StyleSheet, Text, TextInput, View} from 'react-native';
import {colors} from '../theme/colors';

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
        placeholder="Enter a city, e.g. Berlin"
        placeholderTextColor={colors.textSecondary}
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
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: colors.error,
  },
});

export default LocationInput;
