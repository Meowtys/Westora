import React, { useState, useCallback } from 'react';
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
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{userName}</Text>
          </View>
          <Text style={styles.headerIcon}>💰</Text>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceContent}>
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <Text style={styles.balanceAmount}>₱{balance.toFixed(2)}</Text>
          </View>
          <View style={styles.balanceIcon}>
            <Text style={styles.trendingIcon}>📈</Text>
          </View>
        </View>

        {/* Summary Cards */}
        <View style={styles.row}>
          <View style={[styles.summaryCard, styles.incomeCard]}>
            <View style={styles.summaryIconContainer}>
              <Text style={styles.summaryIcon}>🟢</Text>
            </View>
            <Text style={styles.summaryLabel}>Income</Text>
            <Text style={[styles.summaryAmount, { color: '#10B981' }]}>+₱{income.toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryCard, styles.expenseCard]}>
            <View style={styles.summaryIconContainer}>
              <Text style={styles.summaryIcon}>🔴</Text>
            </View>
            <Text style={styles.summaryLabel}>Expenses</Text>
            <Text style={[styles.summaryAmount, { color: '#EF4444' }]}>-₱{expense.toFixed(2)}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <Pressable style={styles.btn} onPress={() => navigation.navigate('AddTransaction')}>
          <Text style={styles.btnIcon}>➕</Text>
          <Text style={styles.btnText}>Add Transaction</Text>
        </Pressable>
        <Pressable style={styles.btnOutline} onPress={() => navigation.navigate('TransactionList')}>
          <Text style={styles.btnOutlineIcon}>📋</Text>
          <Text style={styles.btnOutlineText}>View All Transactions</Text>
        </Pressable>
        <Pressable style={styles.btnOutline} onPress={() => navigation.navigate('MonthlySummary')}>
          <Text style={styles.btnOutlineIcon}>📊</Text>
          <Text style={styles.btnOutlineText}>Monthly Summary</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { padding: 20, paddingTop: 12 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 28,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
  },
  headerIcon: {
    fontSize: 28,
  },
  balanceCard: {
    backgroundColor: '#4F46E5',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  balanceContent: {
    flex: 1,
  },
  balanceLabel: {
    color: '#E0E7FF',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  balanceIcon: {
    opacity: 0.3,
  },
  trendingIcon: {
    fontSize: 40,
  },
  row: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  incomeCard: {
    backgroundColor: '#ECFDF5',
  },
  expenseCard: {
    backgroundColor: '#FEF2F2',
  },
  summaryIconContainer: {
    marginBottom: 10,
  },
  summaryIcon: {
    fontSize: 24,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  btn: {
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  btnIcon: {
    fontSize: 18,
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.2,
  },
  btnOutline: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#fff',
  },
  btnOutlineIcon: {
    fontSize: 16,
  },
  btnOutlineText: {
    color: '#4F46E5',
    fontWeight: '600',
    fontSize: 15,
    letterSpacing: 0.2,
  },
});
