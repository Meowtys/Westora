import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction } from '../types';

export interface UserAccount {
  id: string;
  name: string;
  pin: string;
}

const USERS_KEY = 'westora_users';
const CURRENT_USER_KEY = 'westora_current_user';
const TRANSACTIONS_KEY_BASE = 'westora_transactions'; // Base key string

// ==========================================
// SESSION MANAGEMENT (ACTIVE USER)
// ==========================================

export async function getCurrentUser(): Promise<UserAccount | null> {
  const data = await AsyncStorage.getItem(CURRENT_USER_KEY);
  return data ? JSON.parse(data) : null;
}

export async function setCurrentUser(user: UserAccount | null): Promise<void> {
  if (user) {
    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    await AsyncStorage.removeItem(CURRENT_USER_KEY);
  }
}

// ==========================================
// USER PROFILE MANAGEMENT
// ==========================================

export async function getUsers(): Promise<UserAccount[]> {
  const data = await AsyncStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
}

export async function addUser(name: string, pin: string): Promise<UserAccount> {
  const existing = await getUsers();
  const newUser: UserAccount = {
    id: Date.now().toString(),
    name,
    pin,
  };
  existing.push(newUser);
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(existing));
  await setCurrentUser(newUser); 
  return newUser;
}

export async function removeUser(id: string): Promise<void> {
  const existing = await getUsers();
  const updated = existing.filter(user => user.id !== id);
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(updated));
  
  // Clean up that specific user's transaction data from storage when deleted
  await AsyncStorage.removeItem(`${TRANSACTIONS_KEY_BASE}_${id}`);
}

export async function updateUser(updatedUser: UserAccount): Promise<void> {
  const existing = await getUsers();
  const index = existing.findIndex(u => u.id === updatedUser.id);
  if (index >= 0) {
    existing[index] = updatedUser;
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(existing));
  }
  await setCurrentUser(updatedUser);
}

// ==========================================
// TRANSACTION MANAGEMENT (USER ISOLATED)
// ==========================================

/**
 * Helper function to generate a distinct storage key for the active session user
 */
async function getScopedTransactionKey(): Promise<string | null> {
  const user = await getCurrentUser();
  return user ? `${TRANSACTIONS_KEY_BASE}_${user.id}` : null;
}

export async function getTransactions(): Promise<Transaction[]> {
  const key = await getScopedTransactionKey();
  if (!key) return []; // Return empty array if no active user session found
  
  const data = await AsyncStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

export async function saveTransaction(tx: Transaction): Promise<void> {
  const key = await getScopedTransactionKey();
  if (!key) return;

  const existing = await getTransactions();
  const existingIndex = existing.findIndex(t => t.id === tx.id);

  if (existingIndex >= 0) {
    existing[existingIndex] = tx; // Update existing
  } else {
    existing.push(tx); // Append new
  }

  await AsyncStorage.setItem(key, JSON.stringify(existing));
}

export async function deleteTransaction(id: string): Promise<void> {
  const key = await getScopedTransactionKey();
  if (!key) return;

  const existing = await getTransactions();
  const updated = existing.filter(tx => tx.id !== id);
  
  await AsyncStorage.setItem(key, JSON.stringify(updated));
}