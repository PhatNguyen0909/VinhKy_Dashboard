import { useState } from 'react';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../components/AppHeader';
import { colors, spacing } from '../../constants/theme';
import { API_BASE_URL, checkHealth, isApiConfigured } from '../../services/api';

export default function SettingsScreen() {
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState('Chưa kiểm tra');
  const [error, setError] = useState('');

  const verifyBackend = async () => {
    setChecking(true);
    setError('');
    try {
      const result = await checkHealth();
      setStatus(result.database === 'connected' ? 'Đã kết nối' : result.status);
    } catch (requestError) {
      setStatus('Không kết nối');
      setError(requestError instanceof Error ? requestError.message : 'Kiểm tra thất bại.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.content}>
        <AppHeader title="Cài đặt" />
        <View style={styles.panel}>
          <Text style={styles.sectionTitle}>Kết nối backend</Text>
          <Text style={styles.url}>{isApiConfigured() ? API_BASE_URL : 'Chưa cấu hình API URL'}</Text>
          <Text style={styles.hint}>Cập nhật EXPO_PUBLIC_API_URL trong frontend-app/.env rồi khởi động lại Expo.</Text>
          <View style={styles.statusRow}>
            <View style={[styles.dot, status === 'Đã kết nối' ? styles.dotOnline : null]} />
            <Text style={styles.status}>{checking ? 'Đang kiểm tra...' : status}</Text>
          </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable accessibilityRole="button" disabled={checking} onPress={verifyBackend} style={styles.button}>
            <Text style={styles.buttonText}>{checking ? 'Đang kiểm tra...' : 'Kiểm tra kết nối'}</Text>
            <Ionicons name="arrow-forward" size={16} color="#ffffff" />
          </Pressable>
        </View>
        <Link href="/login" asChild>
          <Pressable style={styles.infoRow}>
            <Ionicons name="shield-checkmark-outline" size={19} color={colors.green} />
            <View style={styles.infoCopy}><Text style={styles.infoTitle}>Xác thực</Text><Text style={styles.infoDetail}>Backend hiện không yêu cầu đăng nhập</Text></View>
            <Ionicons name="chevron-forward" size={17} color={colors.muted} />
          </Pressable>
        </Link>
        <Text style={styles.version}>VINHKY DASHBOARD · MOBILE</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, paddingHorizontal: spacing.md, paddingTop: spacing.md, gap: 14 },
  panel: { padding: 17, borderWidth: 1, borderColor: colors.border, borderRadius: 13, backgroundColor: colors.surface, gap: 11 },
  sectionTitle: { color: colors.ink, fontSize: 15, fontWeight: '700' },
  url: { color: colors.green, fontSize: 12, fontWeight: '700' },
  hint: { color: colors.muted, fontSize: 11, lineHeight: 17 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.gold },
  dotOnline: { backgroundColor: '#50a36d' },
  status: { color: colors.ink, fontSize: 11, fontWeight: '600' },
  error: { color: colors.red, fontSize: 11, lineHeight: 16 },
  button: { minHeight: 43, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 10, backgroundColor: colors.green },
  buttonText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
  infoRow: { minHeight: 69, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 15, borderWidth: 1, borderColor: colors.border, borderRadius: 12, backgroundColor: colors.surface },
  infoCopy: { flex: 1, gap: 4 },
  infoTitle: { color: colors.ink, fontSize: 12, fontWeight: '700' },
  infoDetail: { color: colors.muted, fontSize: 10 },
  version: { color: '#9aa69e', fontSize: 9, fontWeight: '700', letterSpacing: 1.1, textAlign: 'center', marginTop: 8 },
});