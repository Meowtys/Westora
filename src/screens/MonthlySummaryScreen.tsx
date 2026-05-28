import React, { useCallback, useState } from 'react';
import { SafeAreaView, View, Text, ScrollView, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getTransactions } from '../storage/storage';
import { Transaction } from '../types';

type MonthlySummary = {
  month: string;
  income: number;
  expense: number;
};

export default function MonthlySummaryScreen() {
  const [summaries, setSummaries] = useState<MonthlySummary[]>([]);

  useFocusEffect(useCallback(() => {
    getTransactions().then(txs => {
      const map: Record<string, { income: number; expense: number }> = {};
      txs.forEach(tx => {
        const key = new Date(tx.date).toLocaleString('default', { month: 'long', year: 'numeric' });
        if (!map[key]) map[key] = { income: 0, expense: 0 };
        if (tx.type === 'income') map[key].income += tx.amount;
        else map[key].expense += tx.amount;
      });
      setSummaries(Object.entries(map).map(([month, v]) => ({ month, ...v })));
    });
  }, []));

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {summaries.length === 0 && <Text style={styles.empty}>No data yet.</Text>}
        {summaries.map(s => (
          <View key={s.month} style={styles.card}>
            <Text style={styles.month}>{s.month}</Text>
            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.label}>Income</Text>
                <Text style={[styles.val, { color: '#10B981' }]}>+{s.income.toFixed(2)}</Text>
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>Expenses</Text>
                <Text style={[styles.val, { color: '#EF4444' }]}>-{s.expense.toFixed(2)}</Text>
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>Net</Text>
                <Text style={[styles.val, { color: s.income - s.expense >= 0 ? '#4F46E5' : '#EF4444' }]}>
                  {(s.income - s.expense).toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: '#F0F4FF' },
  container: { padding: 20 },
  empty:     { textAlign: 'center', color: '#aaa', marginTop: 60, fontSize: 15 },
  card:      { backgroundColor: '#fff', borderRadius: 14, padding: 18, marginBottom: 14 },
  month:     { fontSize: 16, fontWeight: '700', color: '#1a1a2e', marginBottom: 12 },
  row:       { flexDirection: 'row', justifyContent: 'space-between' },
  col:       { alignItems: 'center' },
  label:     { fontSize: 12, color: '#888' },
  val:       { fontSize: 15, fontWeight: '700', marginTop: 4 },
});
