import React, { createContext, useContext, useState } from 'react';
import { AlertModal } from '../components/common/AlertModal';

const AlertContext = createContext();

export function AlertProvider({ children }) {
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    buttonText: 'Tutup',
    onClose: null,
  });

  const showAlert = (config) => {
    setAlertConfig({
      ...config,
      visible: true,
      buttonText: config.buttonText || 'Tutup',
    });
  };

  const hideAlert = () => {
    setAlertConfig((prev) => ({ ...prev, visible: false }));
    if (alertConfig.onClose) {
      alertConfig.onClose();
    }
  };

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <AlertModal
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        buttonText={alertConfig.buttonText}
        onClose={hideAlert}
      />
    </AlertContext.Provider>
  );
}

export const useAlert = () => useContext(AlertContext);
