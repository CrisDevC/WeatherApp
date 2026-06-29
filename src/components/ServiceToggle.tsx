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
    <View style={styles.wrapper}>
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
                isSelected && {backgroundColor: theme.accent},
              ]}>
              <Text style={[styles.label, isSelected && styles.labelSelected]}>
                {name}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
  },
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: '#8A9BB0',
    fontWeight: '500',
  },
  labelSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default ServiceToggle;
