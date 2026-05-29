import React, { useState, useCallback } from 'react';
import { SafeAreaView, View, Text, Pressable, StyleSheet, ScrollView, Modal, TextInput, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { getTransactions, getCurrentUser, setCurrentUser, updateUser, UserAccount } from '../storage/storage';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Home'> };

export default function HomeScreen({ navigation }: Props) {
  const [balance, setBalance] = useState(0);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [userName, setUserName] = useState('');
  const [currentUser, setCurrentUserObject] = useState<UserAccount | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [settingsMode, setSettingsMode] = useState(false);

  useFocusEffect(useCallback(() => {
    getCurrentUser().then((u: UserAccount | null) => { 
      if (u) {
        setUserName(u.name);
        setCurrentUserObject(u);
      } 
    });
    
    getTransactions().then(txs => {
      const inc = txs.filter(t => t.type === 'income').reduce((a: number, t) => a + t.amount, 0);
      const exp = txs.filter(t => t.type === 'expense').reduce((a: number, t) => a + t.amount, 0);
      setIncome(inc);
      setExpense(exp);
      setBalance(inc - exp);
    });
  }, []));

  const handleEditName = () => {
    setEditedName(userName);
    setEditMode(true);
  };

  const handleSaveName = async () => {
    if (!editedName.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }
    
    if (currentUser) {
      const updatedUser = { ...currentUser, name: editedName.trim() };
      await updateUser(updatedUser);
      setUserName(updatedUser.name);
      setCurrentUserObject(updatedUser);
      setEditMode(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', onPress: () => {}, style: 'cancel' },
      {
        text: 'Log Out',
        onPress: async () => {
          setSettingsMode(false);
          await setCurrentUser(null); // Clear active user session
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
        style: 'destructive',
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Edit Name Modal */}
      <Modal
        visible={editMode}
        transparent
        animationType="fade"
        onRequestClose={() => setEditMode(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Your Name</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter your name"
              placeholderTextColor="#aaa"
              value={editedName}
              onChangeText={setEditedName}
              maxLength={24}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <Pressable style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setEditMode(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.modalBtn, styles.saveBtn]} onPress={handleSaveName}>
                <Text style={styles.saveBtnText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Settings Modal */}
      <Modal
        visible={settingsMode}
        transparent
        animationType="fade"
        onRequestClose={() => setSettingsMode(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Settings</Text>
            <View style={styles.settingsMenu}>
              <Pressable style={[styles.settingsOption, styles.logoutOption]} onPress={handleLogout}>
                <Text style={styles.settingsOptionIcon}>🚪</Text>
                <Text style={styles.logoutOptionText}>Log Out</Text>
              </Pressable>
            </View>
            <View style={styles.modalButtons}>
              <Pressable style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setSettingsMode(false)}>
                <Text style={styles.cancelBtnText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Welcome back,</Text>
            <View style={styles.nameRow}>
              <Text style={styles.userName} numberOfLines={1} ellipsizeMode="tail">{userName}</Text>
              <Pressable onPress={handleEditName} style={styles.editButton}>
                <Text style={styles.editIcon}>✏️</Text>
              </Pressable>
            </View>
          </View>
          <Pressable onPress={() => setSettingsMode(true)} style={styles.settingsButton}>
            <Text style={styles.headerIcon}>⚙️</Text>
          </Pressable>
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
  scrollContainer: { padding: 20, paddingTop: 12 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#333',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#F3F4F6',
  },
  cancelBtnText: {
    color: '#6B7280',
    fontWeight: '600',
    fontSize: 14,
  },
  saveBtn: {
    backgroundColor: '#4F46E5',
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  headerLeft: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    maxWidth: '85%',
  },
  editButton: {
    padding: 4,
    flexShrink: 0,
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
  editIcon: {
    fontSize: 16,
  },
  settingsButton: {
    padding: 8,
  },
  headerIcon: {
    fontSize: 28,
  },
  settingsMenu: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingsOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
  },
  logoutOption: {
    backgroundColor: '#FEE2E2',
  },
  settingsOptionIcon: {
    fontSize: 20,
  },
  settingsOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  logoutOptionText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#DC2626',
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