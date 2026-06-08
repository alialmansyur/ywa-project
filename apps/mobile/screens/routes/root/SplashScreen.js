import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { theme } from '../../../constants/AppTheme';
import { Wrench } from 'lucide-react-native';
import { useAuthStore } from '../../../stores/auth.store';

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const { restoreSession, hasRestoredSession, isAuthenticated } = useAuthStore();

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  useEffect(() => {
    if (!hasRestoredSession) {
      return undefined;
    }

    const timer = setTimeout(() => {
      router.replace(isAuthenticated ? '/(tabs)' : '/(auth)/login');
    }, 1500);

    return () => clearTimeout(timer);
  }, [hasRestoredSession, isAuthenticated]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primaryDark} />
      <Animated.View style={[styles.logoContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.iconBox}>
          <Wrench size={48} color={theme.colors.primary} />
        </View>
        <Text style={styles.title}>WTS</Text>
        <Text style={styles.subtitle}>Workshop Tracking System</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  iconBox: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 24,
    marginBottom: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  title: {
    ...theme.typography.h1,
    color: '#fff',
    fontSize: 48,
    letterSpacing: 4,
    marginBottom: 4,
  },
  subtitle: {
    ...theme.typography.body,
    color: 'rgba(255,255,255,0.85)',
    fontSize: 18,
    letterSpacing: 2,
    fontWeight: '500',
  },
});
