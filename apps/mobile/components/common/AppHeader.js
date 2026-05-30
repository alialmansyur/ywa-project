import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../constants/AppTheme';
import { HeaderBackButton, HeaderRightSpacer } from './HeaderBackButton';

export function AppHeader({ options, route, back }) {
  const insets = useSafeAreaInsets();
  
  const title = options?.title !== undefined ? options.title : (route?.name || '');
  const showBack = !!back || options?.headerLeft !== undefined;
  
  return (
    <View style={[styles.header, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        {showBack ? (
          options?.headerLeft ? options.headerLeft({ canGoBack: !!back }) : <HeaderBackButton color="#fff" />
        ) : (
          <HeaderRightSpacer />
        )}
        
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        
        {options?.headerRight ? options.headerRight({ canGoBack: !!back }) : <HeaderRightSpacer />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: theme.colors.primary,
    borderBottomWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
  },
  content: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    ...theme.typography.h3,
    color: '#fff',
    fontSize: 18,
  }
});
