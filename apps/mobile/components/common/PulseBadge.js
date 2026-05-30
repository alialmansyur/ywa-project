import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../constants/AppTheme';

export function PulseBadge({ text, style }) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.15,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scale]);

  return (
    <View style={[styles.container, style]}>
      <Animated.View style={[styles.pulseRing, { transform: [{ scale }] }]} />
      <View style={styles.badge}>
        <Text style={styles.text}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  pulseRing: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.error,
    borderRadius: theme.borderRadius.full,
    opacity: 0.4,
  },
  badge: {
    backgroundColor: theme.colors.error,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  text: {
    ...theme.typography.caption,
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 10,
  },
});
