import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';
import type { Transaction } from '../types/api';
import React from 'react';

const money = (value: number) => new Intl.NumberFormat('vi-VN').format(value);

const shortDate = (value: string) => {
  const [year, month, day] = value.split('-');
  return year && month && day ? `${day}/${month}/${year}` : value;
};

export function TransactionItem({ transaction }: { transaction: Transaction }) {
  const isIncome = transaction.kind === 'revenue';
  return (
    <View style={styles.row}>
      <View
        style={[
          styles.icon,
          { backgroundColor: isIncome ? colors.greenSoft : colors.goldSoft },
        ]}
      >
        <Ionicons
          name={isIncome ? 'arrow-down' : 'arrow-up'}
          size={17}
          color={isIncome ? colors.green : '#ad7443'}
        />
      </View>
      <View style={styles.copy}>
        <Text numberOfLines={1} style={styles.title}>
          {transaction.title}
        </Text>
        <Text numberOfLines={1} style={styles.subtitle}>
          {shortDate(transaction.date)} · {transaction.subtitle}
        </Text>
      </View>
      <Text
        style={[styles.amount, { color: isIncome ? colors.green : colors.ink }]}
      >
        {isIncome ? '+' : '−'}
        {money(transaction.amount)} đ
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#edf1ed',
  },
  icon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
  },
  copy: { flex: 1, minWidth: 0, gap: 4 },
  title: { color: colors.ink, fontSize: 13, fontWeight: '600' },
  subtitle: { color: colors.muted, fontSize: 10 },
  amount: {
    maxWidth: '38%',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'right',
  },
});
