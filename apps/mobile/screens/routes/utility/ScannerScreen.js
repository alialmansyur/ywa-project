import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button } from 'react-native';
import { Stack, router } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { theme } from '../../../constants/AppTheme';
import { useAlert } from '../../../contexts/AlertContext';
import { assetsService } from '../../../services/assets.service';
import { HeaderBackButton } from '../../../components/common/HeaderBackButton';

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const { showAlert } = useAlert();

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={styles.container}><Text style={styles.message}>Kami memerlukan izin kamera untuk memindai QR Aset</Text><Button onPress={requestPermission} title="Izinkan Kamera" /></View>
    );
  }

  const handleBarCodeScanned = async ({ data }) => {
    setScanned(true);
    try {
      const asset = await assetsService.getByQR(data);
      showAlert({ title: 'Aset Terdeteksi', message: `Unit ${asset.code} ditemukan.`, type: 'success', buttonText: 'Pilih Aset', onClose: () => router.push(`/(tabs)/unit-assets/${asset.id}`) });
    } catch (_e) {
      showAlert({ title: 'QR Tidak Valid', message: `QR tidak ditemukan di sistem: ${data}`, type: 'error', buttonText: 'Tutup' });
    }
  };

  return (
    <View style={styles.container}><Stack.Screen options={{ title: 'Scan QR Aset', headerShown: true, headerStyle: { backgroundColor: '#000' }, headerTintColor: '#fff',
          headerBackVisible: false, headerBackTitleVisible: false, headerLeft: () => <HeaderBackButton color="#fff" /> }} /><CameraView style={styles.camera} facing="back" onBarcodeScanned={scanned ? undefined : handleBarCodeScanned} barcodeScannerSettings={{ barcodeTypes: ['qr', 'ean13', 'code128'] }}><View style={styles.overlay}><View style={styles.scanBox} /><Text style={styles.scanText}>Arahkan kamera ke QR Code / Barcode yang menempel di unit fisik</Text></View></CameraView>{scanned && <TouchableOpacity style={styles.rescanBtn} onPress={() => setScanned(false)}><Text style={styles.rescanText}>Scan Ulang</Text></TouchableOpacity>}</View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, justifyContent: 'center', backgroundColor: '#000' }, message: { textAlign: 'center', paddingBottom: 10, color: '#fff', ...theme.typography.body }, camera: { flex: 1 }, overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }, scanBox: { width: 250, height: 250, borderWidth: 2, borderColor: theme.colors.primary, backgroundColor: 'transparent', borderRadius: theme.borderRadius.lg }, scanText: { color: '#fff', ...theme.typography.caption, textAlign: 'center', marginTop: theme.spacing.xl, paddingHorizontal: theme.spacing.xl }, rescanBtn: { position: 'absolute', bottom: 50, alignSelf: 'center', backgroundColor: theme.colors.primary, paddingVertical: 12, paddingHorizontal: 24, borderRadius: theme.borderRadius.full }, rescanText: { color: '#fff', fontWeight: 'bold' } });
