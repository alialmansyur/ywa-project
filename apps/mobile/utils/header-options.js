import React from 'react';
import { TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { theme } from '../constants/AppTheme';
import { HeaderBackButton, HeaderRightSpacer } from '../components/common/HeaderBackButton';

export function createHeaderOptions({
  title,
  backgroundColor = theme.colors.primary,
  tintColor = '#fff',
  withBack = true,
  left = null,
  right = null,
  style = {},
  shown = true,
}) {
  return {
    title,
    headerShown: shown,
    headerStyle: { backgroundColor, ...style },
    headerTintColor: tintColor,
    headerTitleAlign: 'center',
    headerBackVisible: false,
    headerBackTitleVisible: false,
    headerLeft: left !== null ? left : withBack ? () => <HeaderBackButton color={tintColor} /> : undefined,
    headerRight: right || (withBack ? () => <HeaderRightSpacer /> : undefined),
  };
}

export function createHeaderIconButton({ onPress, icon }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ marginRight: 16 }}>
      {icon}
    </TouchableOpacity>
  );
}

export function createDefaultBackHandler() {
  return () => {
    if (typeof router.canGoBack === 'function' && router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)');
  };
}
