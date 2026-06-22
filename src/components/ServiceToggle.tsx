import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {getServiceTheme} from '../theme/colors';

export interface ServiceToggleProps {
  options: ReadonlyArray<string>;
  selected: string;
  onSelect: (name: string) => void;
}

const ServiceToggle: React.FC<ServiceToggleProps> = ({
  options,
  selected,
  onSelect,
}) => {
  return (
    <View style={styles.container}>
      {options.map(name => {
        const isSelected = name === selected;
        const theme = getServiceTheme(name);
        return (
          <Pressable
            key={name}
            onPress={() => onSelect(name)}
            accessibilityRole="button"
            accessibilityState={{selected: isSelected}}
            accessibilityLabel={`Switch to ${name}`}
            style={[
              styles.button,
              isSelected
                ? {backgroundColor: theme.accent, borderColor: theme.accent}
                : styles.buttonIdle,
            ]}>
            <Text style={[styles.label, isSelected && styles.labelSelected]}>
              {name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  buttonIdle: {
    borderColor: '#E0E0E0',
  },
  label: {
    fontSize: 14,
    color: '#1A1A1A',
  },
  labelSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default ServiceToggle;
