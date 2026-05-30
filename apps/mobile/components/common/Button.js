import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { theme } from '../../constants/AppTheme';

export function Button({ title, onPress, variant = 'primary', style, textStyle, loading = false, disabled = false, icon }) {
  const isOutline = variant === 'outline';
  
  return (
    <TouchableOpacity
      style={[
        styles.button,
        isOutline ? styles.buttonOutline : styles.buttonPrimary,
        disabled && styles.buttonDisabled,
        style
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={isOutline ? theme.colors.primary : '#fff'} />
      ) : (
        <>
          {icon && (
            React.isValidElement(icon) ? 
              React.cloneElement(icon, { style: [{ marginRight: 8 }, icon.props.style] }) :
              (
                (() => {
                  const IconComponent = icon;
                  return <IconComponent size={20} color={isOutline ? theme.colors.primary : '#fff'} style={{ marginRight: 8 }} />;
                })()
              )
          )}
          <Text style={[
            styles.text,
            isOutline ? styles.textOutline : styles.textPrimary,
            textStyle
          ]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    height: 50,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  buttonPrimary: {
    backgroundColor: theme.colors.primary,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  textPrimary: {
    color: '#fff',
  },
  textOutline: {
    color: theme.colors.primary,
  },
});
