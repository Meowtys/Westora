import React, { useEffect, useState, useCallback } from 'react';
import { SafeAreaView, View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { getTransactions, getUser } from '../storage/storage';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Home'> };

export default function HomeScreen({ navigation }: Props) {
  const [balance, setBalance] = useState(0);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [userName, setUserName] = useState('');

  useFocusEffect(useCallback(() => {
    getUser().then(u => { if (u) setUserName(u.name); });
    getTransactions().then(txs => {
      const inc = txs.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
      const exp = txs.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
      setIncome(inc);
      setExpense(exp);
      setBalance(inc - exp);
    });
  }, []));

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.greeting}>Hello, {userName}!</Text>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>PHP {balance.toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <View style={[styles.summaryCard, { backgroundColor: '#ECFDF5' }]}>
            <Text style={styles.summaryLabel}>Income</Text>
            <Text style={[styles.summaryAmount, { color: '#10B981' }]}>+{income.toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: '#FEF2F2' }]}>
            <Text style={styles.summaryLabel}>Expenses</Text>
            <Text style={[styles.summaryAmount, { color: '#EF4444' }]}>-{expense.toFixed(2)}</Text>
          </View>
        </View>
        <Pressable style={styles.btn} onPress={() => navigation.navigate('AddTransaction')}>
          <Text style={styles.btnText}>+ Add Transaction</Text>
        </Pressable>
        <Pressable style={styles.btnOutline} onPress={() => navigation.navigate('TransactionList')}>
          <Text style={styles.btnOutlineText}>View All Transactions</Text>
        </Pressable>
        <Pressable style={styles.btnOutline} onPress={() => navigation.navigate('MonthlySummary')}>
          <Text style={styles.btnOutlineText}>Monthly Summary</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: '#F0F4FF' },
  container:     { padding: 24 },
  greeting:      { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 20 },
  balanceCard:   { backgroundColor: '#4F46E5', borderRadius: 16, padding: 28,
                   alignItems: 'center', marginBottom: 16 },
  balanceLabel:  { color: '#C7D2FE', fontSize: 14, marginBottom: 8 },
  balanceAmount: { color: '#fff', fontSize: 36, fontWeight: '800' },
  row:           { flexDirection: 'row', gap: 12, marginBottom: 24 },
  summaryCard:   { flex: 1, borderRadius: 12, padding: 16 },
  summaryLabel:  { fontSize: 13, color: '#555', marginBottom: 4 },
  summaryAmount: { fontSize: 20, fontWeight: '700' },
  btn:           { backgroundColor: '#4F46E5', padding: 16, borderRadius: 12,
                   alignItems: 'center', marginBottom: 12 },
  btnText:       { color: '#fff', fontWeight: '700', fontSize: 15 },
  btnOutline:    { borderWidth: 1, borderColor: '#4F46E5', padding: 14,
                   borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  btnOutlineText:{ color: '#4F46E5', fontWeight: '600', fontSize: 15 },
});
