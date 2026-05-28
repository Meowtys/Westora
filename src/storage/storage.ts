import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction } from '../types';

const TRANSACTIONS_KEY = 'westora_transactions';
const USER_KEY = 'westora_user';

export async function saveUser(name: string, pin: string): Promise<void> {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify({ name, pin }));
}

export async function getUser(): Promise<{ name: string; pin: string } | null> {
  const data = await AsyncStorage.getItem(USER_KEY);
  return data ? JSON.parse(data) : null;
}

export async function getTransactions(): Promise<Transaction[]> {
  const data = await AsyncStorage.getItem(TRANSACTIONS_KEY);
  return data ? JSON.parse(data) : [];
}

export async function saveTransaction(tx: Transaction): Promise<void> {
  const existing = await getTransactions();
  existing.push(tx);
  await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(existing));
}

export async function deleteTransaction(id: string): Promise<void> {
  const existing = await getTransactions();
  const updated = existing.filter(tx => tx.id !== id);
  await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(updated));
}
