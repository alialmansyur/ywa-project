import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../constants/AppTheme';

export function Badge({ text, variant = 'primary', style }) {
  const getColors = () => {
    switch (variant) {
      case 'success':
        return { bg: theme.colors.primaryLight, text: theme.colors.primaryDark };
      case 'error':
        return { bg: '#FEE2E2', text: '#991B1B' };
      case 'warning':
        return { bg: '#FEF3C7', text: '#92400E' };
      case 'default':
      default:
        return { bg: theme.colors.surface, text: theme.colors.textSecondary };
    }
  };

  const colors = getColors();

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }, style]}>
      <Text style={[styles.text, { color: colors.text }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
