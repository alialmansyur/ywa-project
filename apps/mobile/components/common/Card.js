import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../../constants/AppTheme';

export function Card({ children, style }) {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    // Menghilangkan semua elemen shadow sesuai permintaan Modern Flat Design
  },
});
