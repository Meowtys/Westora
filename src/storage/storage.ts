import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction } from '../types';

export interface UserAccount {
  id: string;
  name: string;
  pin: string;
}

const TRANSACTIONS_KEY = 'westora_transactions';
const USERS_KEY = 'westora_users';
const CURRENT_USER_KEY = 'westora_current_user';

// ==========================================
// SESSION MANAGEMENT (ACTIVE USER)
// ==========================================

/**
 * Gets the currently active user session.
 */
export async function getCurrentUser(): Promise<UserAccount | null> {
  const data = await AsyncStorage.getItem(CURRENT_USER_KEY);
  return data ? JSON.parse(data) : null;
}

/**
 * Sets or clears the active user session.
 */
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

/**
 * Retrieves the complete array of user accounts.
 */
export async function getUsers(): Promise<UserAccount[]> {
  const data = await AsyncStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
}

/**
 * Appends a new account and updates the active session to this user.
 */
export async function addUser(name: string, pin: string): Promise<UserAccount> {
  const existing = await getUsers();
  const newUser: UserAccount = {
    id: Date.now().toString(), // Generates a unique string ID based on timestamp
    name,
    pin,
  };
  existing.push(newUser);
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(existing));
  await setCurrentUser(newUser); // Automatically log in the freshly created user
  return newUser;
}

/**
 * Removes a user account by ID.
 */
export async function removeUser(id: string): Promise<void> {
  const existing = await getUsers();
  const updated = existing.filter(user => user.id !== id);
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(updated));
}

/**
 * Updates a specific user's details inside the array and syncs the current session.
 */
export async function updateUser(updatedUser: UserAccount): Promise<void> {
  const existing = await getUsers();
  const index = existing.findIndex(u => u.id === updatedUser.id);
  if (index >= 0) {
    existing[index] = updatedUser;
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(existing));
  }
  await setCurrentUser(updatedUser); // Keep active session properties in sync
}

// ==========================================
// TRANSACTION MANAGEMENT
// ==========================================

/**
 * Fetches all logged transactions.
 */
export async function getTransactions(): Promise<Transaction[]> {
  const data = await AsyncStorage.getItem(TRANSACTIONS_KEY);
  return data ? JSON.parse(data) : [];
}

/**
 * Saves or updates an individual transaction while preserving order.
 */
export async function saveTransaction(tx: Transaction): Promise<void> {
  const existing = await getTransactions();
  const existingIndex = existing.findIndex(t => t.id === tx.id);

  if (existingIndex >= 0) {
    existing[existingIndex] = tx; // Upsert: update element position match
  } else {
    existing.push(tx); // Append new
  }

  await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(existing));
}

/**
 * Removes a transaction by ID.
 */
export async function deleteTransaction(id: string): Promise<void> {
  const existing = await getTransactions();
  const updated = existing.filter(tx => tx.id !== id);
  await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(updated));
}