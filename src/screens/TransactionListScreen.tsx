import React, { useCallback, useState } from 'react';
import { SafeAreaView, View, Text, FlatList, Pressable, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Transaction } from '../types';
import { getTransactions, deleteTransaction } from '../storage/storage';

export default function TransactionListScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useFocusEffect(useCallback(() => {
    getTransactions().then(txs => setTransactions([...txs].reverse()));
  }, []));

  const handleDelete = (id: string) => {
    Alert.alert('Delete', 'Remove this transaction?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await deleteTransaction(id);
        setTransactions(prev => prev.filter(t => t.id !== id));
      }},
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={transactions}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No transactions yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardLeft}>
              <Text style={styles.category}>{item.category}</Text>
              <Text style={styles.note}>{item.note || 'No note'}</Text>
              <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
            </View>
            <View style={styles.cardRight}>
              <Text style={[styles.amount,
                { color: item.type === 'income' ? '#10B981' : '#EF4444' }]}>
                {item.type === 'income' ? '+' : '-'}PHP {item.amount.toFixed(2)}
              </Text>
              <Pressable onPress={() => handleDelete(item.id)}>
                <Text style={styles.delete}>Delete</Text>
              </Pressable>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: '#F0F4FF' },
  list:      { padding: 16 },
  empty:     { textAlign: 'center', color: '#aaa', marginTop: 60, fontSize: 15 },
  card:      { backgroundColor: '#fff', borderRadius: 12, padding: 16,
               marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between' },
  cardLeft:  { flex: 1 },
  cardRight: { alignItems: 'flex-end' },
  category:  { fontWeight: '700', fontSize: 15, color: '#1a1a2e' },
  note:      { fontSize: 13, color: '#888', marginTop: 2 },
  date:      { fontSize: 12, color: '#aaa', marginTop: 4 },
  amount:    { fontWeight: '700', fontSize: 15 },
  delete:    { color: '#EF4444', fontSize: 13, marginTop: 6 },
});
