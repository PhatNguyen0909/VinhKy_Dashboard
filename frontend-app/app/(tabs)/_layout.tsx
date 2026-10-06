import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.green,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginBottom: 2 },
        tabBarStyle: {
          height: 64,
          paddingTop: 7,
          paddingBottom: 6,
          borderTopColor: colors.border,
          backgroundColor: colors.surface,
        },
      }}
    >
      <Tabs.Screen
        name='dashboard'
        options={{
          title: 'Tổng quan',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='grid-outline' color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name='expenses'
        options={{
          title: 'Chi phí',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name='arrow-up-circle-outline'
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name='revenue'
        options={{
          title: 'Doanh thu',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name='arrow-down-circle-outline'
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name='settings'
        options={{
          title: 'Cài đặt',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='settings-outline' color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
