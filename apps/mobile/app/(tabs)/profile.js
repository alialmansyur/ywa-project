import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Modal, TextInput, Image, Alert } from 'react-native';
import { theme } from '../../constants/AppTheme';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { MapPin, Phone, Mail, Edit3, Lock, Bell, LogOut, Camera, Wrench, X, BadgeCheck, ChevronRight } from 'lucide-react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAlert } from '../../contexts/AlertContext';
import { useAuthStore } from '../../stores/auth.store';

export default function ProfileScreen() {
  const { showAlert } = useAlert();
  const { user, logout, updateProfile, changePassword, requestEmailOtp, verifyEmailOtp, restoreSession, refreshProfile } = useAuthStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [saving, setSaving] = useState(false);
  const [avatarKey, setAvatarKey] = useState(Date.now());

  const [otpStep, setOtpStep] = useState('email'); // 'email', 'otp'
  const [emailValue, setEmailValue] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [debugOtp, setDebugOtp] = useState('');

  const [profileName, setProfileName] = useState('');
  const [profileRole, setProfileRole] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const avatarUri = useMemo(() => {
    if (!user?.avatar) return null;
    const separator = String(user.avatar).includes('?') ? '&' : '?';
    return `${user.avatar}${separator}t=${avatarKey}`;
  }, [user?.avatar, avatarKey]);

  const initials = useMemo(() => {
    const source = user?.name || 'User';
    return source
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((x) => x[0]?.toUpperCase() || '')
      .join('');
  }, [user?.name]);

  const isEmailVerified = !!user?.emailVerifiedAt;
  const normalizedRole = String(user?.role || '').toLowerCase();
  const isDriverRole = normalizedRole === 'driver';
  const isOperatorRole = normalizedRole.includes('operator');
  const canAccessWorkshopPanel = !isDriverRole && !isOperatorRole;

  useEffect(() => {
    if (!user?.id) {
      restoreSession().catch(() => {});
    }
  }, [restoreSession, user?.id]);

  useEffect(() => {
    setEmailValue(user?.email || '');
    setProfileName(user?.name || '');
    setProfileRole(user?.role ? String(user.role) : 'Operator');
    setProfilePhone(user?.phone || '');
  }, [user]);

  const openModal = (type) => {
    setModalType(type);
    setOtpStep('email');
    setOtpValue('');
    setDebugOtp('');
    setOldPassword('');
    setNewPassword('');
    setNewPasswordConfirm('');
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setModalType(null);
    setAvatarFile(null);
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const confirmLogout = () => {
    Alert.alert(
      'Konfirmasi Keluar',
      'Apakah Anda yakin ingin keluar dari akun ini?',
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Keluar', style: 'destructive', onPress: handleLogout },
      ]
    );
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile({ name: profileName, phone: profilePhone });
      await refreshProfile();
      closeModal();
      setTimeout(() => showAlert({ title: 'Berhasil Disimpan', message: 'Profil Anda telah berhasil diperbarui.', type: 'success' }), 300);
    } catch (error) {
      showAlert({ title: 'Gagal', message: error?.message || 'Gagal memperbarui profil.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleSendEmailOtp = async () => {
    setSaving(true);
    try {
      const response = await requestEmailOtp(emailValue);
      if (response?.debug_otp) setDebugOtp(response.debug_otp);
      setOtpStep('otp');
      showAlert({ title: 'OTP Dikirim', message: 'Kode OTP telah dikirim ke email tujuan.', type: 'success' });
    } catch (error) {
      showAlert({ title: 'Gagal', message: error?.message || 'Gagal mengirim OTP.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    setSaving(true);
    try {
      await verifyEmailOtp(emailValue, otpValue);
      await refreshProfile();
      closeModal();
      setTimeout(() => showAlert({ title: 'Verifikasi Berhasil', message: 'Email Anda telah berhasil diverifikasi.', type: 'success' }), 300);
    } catch (error) {
      showAlert({ title: 'OTP Tidak Valid', message: error?.message || 'Kode OTP salah atau kedaluwarsa.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const pickAvatar = async (fromCamera = false) => {
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.6, allowsEditing: true, aspect: [1, 1] })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.6, allowsEditing: true, aspect: [1, 1] });

    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      setAvatarFile({
        uri: asset.uri,
        name: `avatar-${Date.now()}.jpg`,
        type: 'image/jpeg',
      });
    }
  };

  const handleSaveAvatar = async () => {
    if (!avatarFile?.uri) {
      showAlert({ title: 'Avatar Belum Dipilih', message: 'Silakan pilih gambar terlebih dahulu.', type: 'warning' });
      return;
    }

    setSaving(true);
    try {
      await updateProfile({ avatar: avatarFile });
      await refreshProfile();
      setAvatarKey(Date.now());
      closeModal();
      setTimeout(() => showAlert({ title: 'Berhasil', message: 'Avatar profil berhasil diperbarui.', type: 'success' }), 300);
    } catch (error) {
      showAlert({ title: 'Gagal', message: error?.message || 'Gagal mengunggah avatar.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !newPasswordConfirm) {
      showAlert({ title: 'Validasi', message: 'Semua field password wajib diisi.', type: 'error' });
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      showAlert({ title: 'Validasi', message: 'Konfirmasi password tidak sama.', type: 'error' });
      return;
    }
    setSaving(true);
    try {
      await changePassword(oldPassword, newPassword);
      closeModal();
      setTimeout(() => showAlert({ title: 'Berhasil Disimpan', message: 'Password Anda telah berhasil diperbarui.', type: 'success' }), 300);
    } catch (error) {
      showAlert({ title: 'Gagal', message: error?.message || 'Gagal mengubah password.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Profile Header Section */}
      <View style={styles.header}>
        <View style={styles.headerOrbA} />
        <View style={styles.headerOrbB} />
        <View style={styles.avatarContainer}>
          <View style={styles.avatarPlaceholder}>
            {avatarUri ? <Image key={avatarKey} source={{ uri: avatarUri }} style={styles.avatarImage} /> : <Text style={styles.avatarText}>{initials}</Text>}
          </View>
          <TouchableOpacity style={styles.editAvatarBtn} activeOpacity={0.8} onPress={() => openModal('avatar')}>
            <Camera size={16} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{user?.name || '-'}</Text>
          {isEmailVerified ? <BadgeCheck size={18} color={theme.colors.success} style={{ marginLeft: 6 }} /> : null}
        </View>
        <Text style={styles.role}>{profileRole || '-'}</Text>
        <View style={styles.headerPills}>
          <View style={styles.headerPill}><Text style={styles.headerPillText}>Akun Aktif</Text></View>
          <View style={styles.headerPillGhost}><Text style={styles.headerPillGhostText}>{isEmailVerified ? 'Email Terverifikasi' : 'Email Belum Verifikasi'}</Text></View>
        </View>
      </View>

      <View style={styles.content}>
        {/* Mechanic Workstation Access */}
        {canAccessWorkshopPanel && (
          <Card style={styles.mechanicCard}>
            <View style={styles.mechanicIconBox}>
              <Wrench size={24} color="#fff" />
            </View>
            <View style={styles.mechanicInfo}>
              <Text style={styles.mechanicTitle}>Panel Workshop</Text>
              <Text style={styles.mechanicDesc}>Akses kontrol eksekusi perbaikan dan antrian workshop.</Text>
            </View>
            <TouchableOpacity
              style={styles.mechanicBtn}
              onPress={() => router.push('/(tabs)/mechanic')}
            >
              <Text style={styles.mechanicBtnText}>Buka Panel</Text>
            </TouchableOpacity>
          </Card>
        )}

        {/* Info Section */}
        <Card style={[styles.card, !canAccessWorkshopPanel && styles.infoCardWithTopGap]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Informasi Profil</Text>
            <Text style={styles.sectionSub}>Data utama akun Anda</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Phone size={20} color={theme.colors.primary} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Nomor Telepon</Text>
              <Text style={styles.infoText}>{user?.phone || '-'}</Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <Mail size={20} color={theme.colors.primary} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Alamat Email</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.infoText}>{user?.email || '-'}</Text>
                {isEmailVerified && (
                  <BadgeCheck size={16} color={theme.colors.success} style={{ marginLeft: 6 }} />
                )}
              </View>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <MapPin size={20} color={theme.colors.primary} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Lokasi Tugas</Text>
              <Text style={styles.infoText}>{user?.dutyLocation || '-'}</Text>
            </View>
          </View>
        </Card>

        {/* Account Settings Section */}
        <Card style={styles.settingsCard}>
          <Text style={styles.sectionTitlePad}>Pengaturan Akun</Text>
          <Text style={styles.sectionSubPad}>Kelola profil, email, dan keamanan akun</Text>
          
          <TouchableOpacity style={styles.settingRow} activeOpacity={0.6} onPress={() => openModal('profile')}>
            <View style={styles.settingLeft}>
              <Edit3 size={22} color={theme.colors.textSecondary} />
              <Text style={styles.settingText}>Ubah Profil</Text>
            </View>
            <ChevronRight size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingRow} activeOpacity={0.6} onPress={() => openModal('email')}>
            <View style={styles.settingLeft}>
              <Mail size={22} color={theme.colors.textSecondary} />
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.settingText}>Atur Email</Text>
                {isEmailVerified && <BadgeCheck size={16} color={theme.colors.success} style={{ marginLeft: 6 }} />}
              </View>
            </View>
            <ChevronRight size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingRow} activeOpacity={0.6} onPress={() => openModal('password')}>
            <View style={styles.settingLeft}>
              <Lock size={22} color={theme.colors.textSecondary} />
              <Text style={styles.settingText}>Ubah Password</Text>
            </View>
            <ChevronRight size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </Card>

        {/* App Settings Section */}
        <Card style={styles.settingsCard}>
          <Text style={styles.sectionTitlePad}>Pengaturan Aplikasi</Text>
          <Text style={styles.sectionSubPad}>Atur preferensi notifikasi</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Bell size={22} color={theme.colors.textSecondary} />
              <Text style={styles.settingText}>Notifikasi Push</Text>
            </View>
            <Switch value={true} trackColor={{ true: theme.colors.primary, false: '#ccc' }} />
          </View>
        </Card>

        <Button
          title="Keluar (Log Out)"
          variant="primary"
          icon={LogOut}
          onPress={confirmLogout}
          style={styles.logoutButton}
        />
        
        <Text style={styles.versionText}>TAPG App v1.0.0</Text>
      </View>

      {/* Modal Setup */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={closeModal} statusBarTranslucent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {modalType === 'profile' ? 'Ubah Profil' : 
                 modalType === 'email' ? 'Atur Email' : 
                 modalType === 'password' ? 'Ubah Password' : 'Ubah Avatar'}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              {modalType === 'profile' && (
                <>
                  <Text style={styles.inputLabel}>Nama Lengkap</Text>
                  <TextInput style={styles.input} value={profileName} onChangeText={setProfileName} placeholderTextColor={theme.colors.textSecondary} />
                  <Text style={styles.inputLabel}>Jabatan / Posisi</Text>
                  <TextInput style={styles.input} value={profileRole} onChangeText={setProfileRole} placeholderTextColor={theme.colors.textSecondary} editable={false} />
                  <Text style={styles.inputLabel}>Nomor Telepon</Text>
                  <TextInput style={styles.input} value={profilePhone} onChangeText={setProfilePhone} placeholderTextColor={theme.colors.textSecondary} />
                </>
              )}

              {modalType === 'email' && otpStep === 'email' && (
                <>
                  <Text style={styles.inputLabel}>Alamat Email Baru</Text>
                  <TextInput 
                    style={styles.input} 
                    value={emailValue}
                    onChangeText={setEmailValue}
                    keyboardType="email-address" 
                    placeholderTextColor={theme.colors.textSecondary} 
                  />
                  {isEmailVerified && (
                    <Text style={{ ...theme.typography.caption, color: theme.colors.success, marginTop: 8 }}>
                      ✓ Email ini sudah diverifikasi.
                    </Text>
                  )}
                </>
              )}

              {modalType === 'email' && otpStep === 'otp' && (
                <>
                  <Text style={styles.inputLabel}>Kode OTP (6 Digit)</Text>
                  <Text style={{ ...theme.typography.caption, color: theme.colors.textSecondary, marginBottom: 8 }}>
                    Kode telah dikirim ke {emailValue}
                  </Text>
                  <TextInput 
                    style={[styles.input, { textAlign: 'center', fontSize: 24, letterSpacing: 8 }]} 
                    value={otpValue}
                    onChangeText={setOtpValue}
                    keyboardType="number-pad" 
                    maxLength={6}
                    placeholder="------"
                    placeholderTextColor={theme.colors.textSecondary} 
                  />
                  {!!debugOtp && (
                    <Text style={{ ...theme.typography.caption, color: theme.colors.textSecondary, marginTop: 8 }}>
                      OTP Debug (local): {debugOtp}
                    </Text>
                  )}
                </>
              )}

              {modalType === 'password' && (
                <>
                  <Text style={styles.inputLabel}>Password Lama</Text>
                  <TextInput style={styles.input} secureTextEntry value={oldPassword} onChangeText={setOldPassword} placeholder="Masukkan password lama" placeholderTextColor={theme.colors.textSecondary} />
                  <Text style={styles.inputLabel}>Password Baru</Text>
                  <TextInput style={styles.input} secureTextEntry value={newPassword} onChangeText={setNewPassword} placeholder="Masukkan password baru" placeholderTextColor={theme.colors.textSecondary} />
                  <Text style={styles.inputLabel}>Konfirmasi Password</Text>
                  <TextInput style={styles.input} secureTextEntry value={newPasswordConfirm} onChangeText={setNewPasswordConfirm} placeholder="Ketik ulang password baru" placeholderTextColor={theme.colors.textSecondary} />
                </>
              )}

              {modalType === 'avatar' && (
                <>
                  <View style={styles.avatarPreview}>
                    {avatarFile?.uri || user?.avatar ? (
                      <Image key={`preview-${avatarKey}`} source={{ uri: avatarFile?.uri || user?.avatar }} style={styles.avatarImage} />
                    ) : (
                      <Text style={styles.avatarText}>{initials}</Text>
                    )}
                  </View>
                  <Button title="Pilih dari Galeri" variant="outline" onPress={() => pickAvatar(false)} style={{ marginBottom: 12 }} />
                  <Button title="Ambil Foto Baru" variant="outline" onPress={() => pickAvatar(true)} />
                </>
              )}
            </View>

            <View style={styles.modalFooter}>
              {modalType === 'email' && otpStep === 'email' ? (
                <>
                  <Button title="Batal" variant="outline" onPress={closeModal} style={{ flex: 1, marginRight: 8 }} />
                  <Button title={isEmailVerified ? "Tutup" : "Kirim OTP"} onPress={() => {
                    if (isEmailVerified) closeModal();
                    else handleSendEmailOtp();
                  }} style={{ flex: 1 }} loading={saving} />
                </>
              ) : modalType === 'email' && otpStep === 'otp' ? (
                <>
                  <Button title="Kembali" variant="outline" onPress={() => setOtpStep('email')} style={{ flex: 1, marginRight: 8 }} />
                  <Button title="Verifikasi" onPress={handleVerifyEmailOtp} style={{ flex: 1 }} loading={saving} />
                </>
              ) : (
                <>
                  <Button title="Batal" variant="outline" onPress={closeModal} style={{ flex: 1, marginRight: 8 }} />
                  <Button
                    title="Simpan"
                    onPress={() => {
                      if (modalType === 'profile') {
                        handleSaveProfile();
                        return;
                      }
                      if (modalType === 'password') {
                        handleChangePassword();
                        return;
                      }
                      if (modalType === 'avatar') {
                        handleSaveAvatar();
                        return;
                      }
                      closeModal();
                    }}
                    style={{ flex: 1 }}
                    loading={saving}
                  />
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xxl,
  },
  header: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.primary,
    overflow: 'hidden',
  },
  headerOrbA: {
    position: 'absolute',
    top: -34,
    right: -22,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  headerOrbB: {
    position: 'absolute',
    top: 36,
    right: 58,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: theme.spacing.md,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: theme.colors.primaryDark,
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  name: {
    ...theme.typography.h2,
    color: '#fff',
  },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  role: {
    ...theme.typography.body,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
    marginTop: 4,
  },
  headerPills: { flexDirection: 'row', marginTop: theme.spacing.sm, gap: 8 },
  headerPill: { backgroundColor: '#fff', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  headerPillText: { ...theme.typography.caption, color: theme.colors.primaryDark, fontWeight: '700', fontSize: 11 },
  headerPillGhost: { backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  headerPillGhostText: { ...theme.typography.caption, color: '#fff', fontWeight: '600', fontSize: 11 },
  content: {
    padding: theme.spacing.md,
    marginTop: -theme.spacing.sm,
  },
  mechanicCard: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
    borderWidth: 1,
    padding: theme.spacing.md,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mechanicIconBox: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.md,
  },
  mechanicInfo: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  mechanicTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: 2,
  },
  mechanicDesc: {
    ...theme.typography.caption,
    fontSize: 14,
    lineHeight: 20,
  },
  mechanicBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: theme.borderRadius.full,
  },
  mechanicBtnText: {
    ...theme.typography.caption,
    color: '#fff',
    fontWeight: 'bold',
  },
  card: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  infoCardWithTopGap: {
    marginTop: theme.spacing.lg,
  },
  sectionHeader: {
    marginBottom: theme.spacing.md,
    gap: 2,
  },
  sectionSub: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  sectionSubPad: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    marginTop: -theme.spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  infoTextContainer: {
    marginLeft: theme.spacing.md,
  },
  infoLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  infoText: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '500',
  },
  sectionTitle: { ...theme.typography.h3, color: theme.colors.text },
  sectionTitlePad: { ...theme.typography.h3, color: theme.colors.text, paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg, paddingBottom: theme.spacing.xs },
  settingsCard: {
    padding: 0,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 18,
    backgroundColor: 'transparent',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginLeft: theme.spacing.md,
    fontWeight: '500',
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
  },
  logoutButton: {
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.error,
    borderColor: theme.colors.error,
    borderWidth: 0,
  },
  versionText: {
    ...theme.typography.caption,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
  },
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
    padding: theme.spacing.lg,
    paddingBottom: 60, // Padding for safe area
    width: '100%',
    marginBottom: -40, // Force push down to cover any native gaps
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  modalTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  modalBody: {
    marginBottom: theme.spacing.xl,
  },
  inputLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.md,
    fontWeight: '600',
  },
  input: {
    ...theme.typography.body,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    height: 50,
    backgroundColor: theme.colors.background,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
  },
  avatarPreview: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  }
});
