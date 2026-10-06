import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../constants/theme';

export default function LoginScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <View style={styles.mark}>
          <Ionicons name='stats-chart' size={23} color={colors.lime} />
        </View>
        <Text style={styles.eyebrow}>VINHKY DASHBOARD</Text>
        <Text style={styles.title}>Không cần đăng nhập</Text>
        <Text style={styles.body}>
          Backend hiện tại không có API xác thực. Ứng dụng kết nối trực tiếp tới
          các endpoint tài chính hiện có, không tạo tài khoản hoặc token giả.
        </Text>
        <Pressable
          accessibilityRole='button'
          onPress={() => router.replace('/(tabs)/dashboard')}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Tiếp tục vào ứng dụng</Text>
          <Ionicons name='arrow-forward' size={17} color='#ffffff' />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, justifyContent: 'center', padding: spacing.xl },
  mark: {
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    backgroundColor: colors.green,
    marginBottom: 25,
  },
  eyebrow: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.3,
  },
  title: { color: colors.ink, fontSize: 28, fontWeight: '700', marginTop: 12 },
  body: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 12,
    marginBottom: 24,
  },
  button: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 12,
    backgroundColor: colors.green,
  },
  buttonText: { color: '#ffffff', fontSize: 13, fontWeight: '700' },
});
