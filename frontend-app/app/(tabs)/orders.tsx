import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  Vibration,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_BASE_URL } from '../../services/api';
import { colors } from '../../constants/theme';

type OrderItem = { name: string; price: number; quantity: number };
type Order = {
  id: number;
  code: string;
  customer_name: string;
  phone: string;
  address?: string;
  note?: string;
  total: number;
  status: string;
  payment_method: string;
  payment_status: string;
  items: OrderItem[];
};

const money = (value: number) => `${Math.round(value).toLocaleString('vi-VN')}đ`;

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const seen = useRef<Set<number> | null>(null);

  const load = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders`);
      if (!response.ok) throw new Error('bad status');
      const data: Order[] = await response.json();
      const urgent = data.filter(
        (o) => o.status === 'new' && o.payment_status === 'paid'
      );
      if (seen.current) {
        const fresh = urgent.filter((o) => !seen.current!.has(o.id));
        if (fresh.length) {
          Vibration.vibrate([0, 400, 200, 400]);
          Alert.alert(
            'Đơn mới đã chuyển khoản',
            fresh.map((o) => `${o.code} - ${money(o.total)}`).join('\n')
          );
        }
      }
      seen.current = new Set(urgent.map((o) => o.id));
      setOrders(data.filter((o) => o.status !== 'done' && o.status !== 'cancelled'));
      setError('');
    } catch {
      setError('Không tải được đơn hàng');
    }
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, 8000);
    return () => clearInterval(timer);
  }, [load]);

  const update = async (id: number, body: Record<string, string>) => {
    await fetch(`${API_BASE_URL}/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    load();
  };

  const renderItem = ({ item }: { item: Order }) => {
    const urgent = item.status === 'new' && item.payment_status === 'paid';
    return (
      <View style={[styles.card, urgent && styles.urgent]}>
        <Text style={styles.code}>
          {item.code} · {money(item.total)}
        </Text>
        <Text style={styles.line}>
          {item.customer_name} · {item.phone}
        </Text>
        {!!item.address && <Text style={styles.line}>{item.address}</Text>}
        {item.items.map((i, idx) => (
          <Text key={idx} style={styles.line}>
            {i.quantity} x {i.name}
          </Text>
        ))}
        <Text style={styles.badge}>
          {item.payment_method === 'transfer' ? 'Chuyển khoản' : 'COD'} ·{' '}
          {item.payment_status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'} ·{' '}
          {item.status}
        </Text>
        <View style={styles.row}>
          {item.payment_status !== 'paid' && (
            <Pressable style={styles.btn} onPress={() => update(item.id, { payment_status: 'paid' })}>
              <Text style={styles.btnText}>Đã thu tiền</Text>
            </Pressable>
          )}
          {item.status === 'new' && (
            <Pressable style={styles.btn} onPress={() => update(item.id, { status: 'preparing' })}>
              <Text style={styles.btnText}>Nhận làm</Text>
            </Pressable>
          )}
          {item.status === 'preparing' && (
            <Pressable style={styles.btn} onPress={() => update(item.id, { status: 'done' })}>
              <Text style={styles.btnText}>Hoàn thành</Text>
            </Pressable>
          )}
          <Pressable style={[styles.btn, styles.cancel]} onPress={() => update(item.id, { status: 'cancelled' })}>
            <Text style={styles.btnText}>Hủy</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.screen}>
      <Text style={styles.title}>Đơn hàng website</Text>
      {!!error && <Text style={styles.error}>{error}</Text>}
      <FlatList
        data={orders}
        keyExtractor={(o) => String(o.id)}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListEmptyComponent={<Text style={styles.line}>Chưa có đơn cần xử lý</Text>}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await load();
              setRefreshing(false);
            }}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  title: { fontSize: 22, fontWeight: '700', color: colors.ink, padding: 16, paddingBottom: 0 },
  error: { color: colors.red, paddingHorizontal: 16, paddingTop: 8 },
  card: { backgroundColor: colors.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: colors.border, gap: 4 },
  urgent: { borderColor: colors.red, borderWidth: 2, backgroundColor: colors.redSoft },
  code: { fontWeight: '700', color: colors.ink, fontSize: 16 },
  line: { color: colors.ink },
  badge: { color: colors.muted, marginTop: 4 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  btn: { backgroundColor: colors.green, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  cancel: { backgroundColor: colors.red },
  btnText: { color: '#fff', fontWeight: '600' },
});
