import React, { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, Pressable, StyleSheet, Alert, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, TransactionType } from '../types';
import { saveTransaction } from '../storage/storage';
import uuid from 'react-native-uuid';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'AddTransaction'> };

const CATEGORIES = ['Food', 'Transport', 'School', 'Entertainment', 'Health', 'Salary', 'Allowance', 'Other'];

export default function AddTransactionScreen({ navigation }: Props) {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [note, setNote] = useState('');

  const handleSave = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }
    await saveTransaction({
      id: uuid.v4() as string,
      type,
      amount: Number(amount),
      category,
      note: note.trim(),
      date: new Date().toISOString(),
    });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.sectionLabel}>Type</Text>
        <View style={styles.row}>
          {(['income', 'expense'] as TransactionType[]).map(t => (
            <Pressable key={t} style={[styles.typeBtn, type === t && styles.typeBtnActive]}
              onPress={() => setType(t)}>
              <Text style={[styles.typeBtnText, type === t && styles.typeBtnTextActive]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.sectionLabel}>Amount (PHP)</Text>
        <TextInput style={styles.input} placeholder="0.00" value={amount}
          onChangeText={setAmount} keyboardType="numeric" />
        <Text style={styles.sectionLabel}>Category</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map(cat => (
            <Pressable key={cat} style={[styles.catBtn, category === cat && styles.catBtnActive]}
              onPress={() => setCategory(cat)}>
              <Text style={[styles.catText, category === cat && styles.catTextActive]}>{cat}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.sectionLabel}>Note (optional)</Text>
        <TextInput style={[styles.input, styles.multiline]} placeholder="Add a note..."
          value={note} onChangeText={setNote} multiline />
        <Pressable style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save Transaction</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:             { flex: 1, backgroundColor: '#F0F4FF' },
  container:        { padding: 24 },
  sectionLabel:     { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 8, marginTop: 16 },
  row:              { flexDirection: 'row', gap: 12 },
  typeBtn:          { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1,
                      borderColor: '#ccc', alignItems: 'center' },
  typeBtnActive:    { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  typeBtnText:      { fontWeight: '600', color: '#555' },
  typeBtnTextActive:{ color: '#fff' },
  input:            { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd',
                      borderRadius: 10, padding: 12, fontSize: 15 },
  multiline:        { height: 80, textAlignVertical: 'top' },
  categoryGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catBtn:           { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                      borderWidth: 1, borderColor: '#ccc', backgroundColor: '#fff' },
  catBtnActive:     { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  catText:          { fontSize: 13, color: '#555' },
  catTextActive:    { color: '#fff' },
  saveBtn:          { backgroundColor: '#4F46E5', padding: 16, borderRadius: 12,
                      alignItems: 'center', marginTop: 24 },
  saveBtnText:      { color: '#fff', fontWeight: '700', fontSize: 16 },
});
