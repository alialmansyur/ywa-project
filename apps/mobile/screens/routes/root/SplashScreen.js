import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, StatusBar, Image } from 'react-native';
import { router } from 'expo-router';
import { theme } from '../../../constants/AppTheme';
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
        <Image source={require('../../../assets/images/logo-app-transparant.png')} style={styles.logoImage} resizeMode="contain" />
        <Text style={styles.title}>YWA</Text>
        <Text style={styles.subtitle}>YWA Maintenance</Text>
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
  logoImage: {
    width: 120,
    height: 120,
    marginBottom: 24,
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
