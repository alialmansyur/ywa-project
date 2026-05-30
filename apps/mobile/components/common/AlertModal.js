import React from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import { theme } from '../../constants/AppTheme';
import { Button } from './Button';
import { CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react-native';

export function AlertModal({ visible, title, message, type = 'info', onClose, buttonText = "Tutup" }) {
  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle size={48} color={theme.colors.success} />;
      case 'warning': return <AlertTriangle size={48} color={theme.colors.warning} />;
      case 'error': return <AlertCircle size={48} color={theme.colors.error} />;
      default: return <Info size={48} color={theme.colors.primary} />;
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.iconWrapper}>
            {getIcon()}
          </View>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalMessage}>{message}</Text>
          
          <Button title={buttonText} onPress={onClose} style={{ width: '100%' }} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContainer: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    paddingBottom: 40,
    alignItems: 'center',
    width: '100%',
  },
  iconWrapper: {
    marginBottom: theme.spacing.md,
  },
  modalTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  modalMessage: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  }
});
