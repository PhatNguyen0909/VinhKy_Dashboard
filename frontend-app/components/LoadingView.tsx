import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/theme';
import React from 'react';

export function LoadingView({
  label = 'Đang tải dữ liệu...',
}: {
  label?: string;
}) {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.green} size='small' />
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 150,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  text: { color: colors.muted, fontSize: 12 },
});
