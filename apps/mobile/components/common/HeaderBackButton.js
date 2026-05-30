import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { router, useNavigation } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

export function HeaderBackButton({ color = '#fff' }) {
  const navigation = useNavigation();

  const handleBack = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
      return;
    }
    router.replace('/(tabs)');
  };

  return (
    <TouchableOpacity onPress={handleBack} style={styles.button} activeOpacity={0.75}>
      <ArrowLeft color={color} size={24} />
    </TouchableOpacity>
  );
}

export function HeaderRightSpacer() {
  return <View style={styles.rightSpacer} />;
}

const styles = StyleSheet.create({
  button: {
    marginLeft: 16,
    width: 24,
    height: 24,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  rightSpacer: {
    marginRight: 16,
    width: 24,
    height: 24,
  },
});
