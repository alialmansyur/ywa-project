import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { theme } from '../../../constants/AppTheme';
import { Eye, EyeOff } from 'lucide-react-native';
import { useAuthStore } from '../../../stores/auth.store';
import { useAlert } from '../../../contexts/AlertContext';

export default function LoginScreen() {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login, isLoading, isAuthenticated } = useAuthStore();
  const { showAlert } = useAlert();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  const handleLogin = async () => {
    try {
      await login(loginId.trim(), password);
      router.replace('/(tabs)');
    } catch (error) {
      showAlert({
        title: 'Login Gagal',
        message: error?.message || 'Terjadi kesalahan saat login.',
        type: 'error',
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>{'Halo,\nSelamat Datang\nKembali'}</Text>
          <Text style={styles.subtitle}>Hai, selamat datang kembali ke ruang kerjamu.</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email / Username"
            placeholder="operator1@ywa.local"
            value={loginId}
            onChangeText={setLoginId}
            keyboardType="default"
            autoCapitalize="none"
          />
          <Input
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            rightIcon={showPassword ? <EyeOff size={20} color={theme.colors.textSecondary} /> : <Eye size={20} color={theme.colors.textSecondary} />}
            onRightIconPress={() => setShowPassword(!showPassword)}
          />

          <Text style={styles.forgotPassword}>Forgot Password?</Text>

          <Button
            title="Masuk ke Sistem"
            onPress={handleLogin}
            loading={isLoading}
            style={styles.loginButton}
          />
          {isLoading && (
            <Text style={styles.processingText}>Memproses data...</Text>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xxl,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    fontSize: 42,
    lineHeight: 48,
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontSize: 16,
  },
  form: {
    width: '100%',
  },
  forgotPassword: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
    marginBottom: theme.spacing.xl,
  },
  loginButton: {
    width: '100%',
  },
  processingText: {
    ...theme.typography.caption,
    textAlign: 'center',
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },
});
