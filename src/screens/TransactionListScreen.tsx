import React, { useCallback, useState } from 'react';
import { SafeAreaView, View, Text, FlatList, Pressable, StyleSheet, Alert, Modal, Image, TextInput, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import { Transaction } from '../types';
import { getTransactions, deleteTransaction, saveTransaction } from '../storage/storage';

export default function TransactionListScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  
  // Edit states
  const [editAmount, setEditAmount] = useState('');
  const [editNote, setEditNote] = useState('');
  const [editImage, setEditImage] = useState<string | undefined>(undefined);

  useFocusEffect(useCallback(() => {
    getTransactions().then(txs => setTransactions([...txs].reverse()));
  }, []));

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setEditAmount(transaction.amount.toString());
    setEditNote(transaction.note);
    setEditImage(transaction.image); // Load the existing image into state
    setEditMode(true);
  };

  const handlePickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      selectionLimit: 1, // Ensure only one image is picked
    });

    if (result.errorCode) {
      Alert.alert('Error', result.errorMessage || 'Failed to pick image');
      return;
    }

    if (!result.didCancel && result.assets && result.assets.length > 0) {
      // The URI might be undefined depending on platform specifics, so we check for it
      const uri = result.assets[0].uri;
      if (uri) {
        setEditImage(uri);
      }
    }
  };

  const handleSaveEdit = async () => {
    if (!editingTransaction) return;
    if (!editAmount || isNaN(Number(editAmount)) || Number(editAmount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }
    
    const updatedTransaction: Transaction = {
      ...editingTransaction,
      amount: Number(editAmount),
      note: editNote.trim(),
      image: editImage, // Save the updated or removed image
    };
    
    await deleteTransaction(editingTransaction.id);
    await saveTransaction(updatedTransaction);
    
    // Reload the transactions list
    const txs = await getTransactions();
    setTransactions([...txs].reverse());
    
    setEditMode(false);
    setEditingTransaction(null);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete', 'Remove this transaction?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await deleteTransaction(id);
        const txs = await getTransactions();
        setTransactions([...txs].reverse());
      }},
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Edit Modal */}
      <Modal
        visible={editMode}
        transparent
        animationType="fade"
        onRequestClose={() => setEditMode(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Transaction</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              
              {/* Image Editor Section */}
              <Text style={styles.modalLabel}>Attachment</Text>
              {editImage ? (
                <View>
                  <Image source={{ uri: editImage }} style={styles.modalImage} />
                  <View style={styles.imageActionButtons}>
                    <Pressable onPress={handlePickImage} style={styles.imageActionBtn}>
                      <Text style={styles.imageActionText}>Change Image</Text>
                    </Pressable>
                    <Pressable onPress={() => setEditImage(undefined)} style={[styles.imageActionBtn, styles.removeBtn]}>
                      <Text style={styles.removeBtnText}>Remove</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <Pressable style={styles.addImageBtn} onPress={handlePickImage}>
                  <Text style={styles.addImageBtnText}>+ Add Image</Text>
                </Pressable>
              )}

              <Text style={styles.modalLabel}>Amount (PHP)</Text>
              <TextInput
                style={styles.modalInput}
                value={editAmount}
                onChangeText={setEditAmount}
                keyboardType="numeric"
              />
              
              <Text style={styles.modalLabel}>Note</Text>
              <TextInput
                style={[styles.modalInput, styles.modalTextarea]}
                value={editNote}
                onChangeText={setEditNote}
                multiline
              />
            </ScrollView>
            
            <View style={styles.modalButtons}>
              <Pressable style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setEditMode(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.modalBtn, styles.saveBtn]} onPress={handleSaveEdit}>
                <Text style={styles.saveBtnText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <FlatList
        data={transactions}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No transactions yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.image && (
              <Image source={{ uri: item.image }} style={styles.cardImage} />
            )}
            <View style={styles.cardContent}>
              <View style={styles.cardLeft}>
                <Text style={styles.category}>{item.category}</Text>
                <Text style={styles.note}>{item.note || 'No note'}</Text>
                <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
              </View>
              <View style={styles.cardRight}>
                <Text style={[styles.amount, { color: item.type === 'income' ? '#10B981' : '#EF4444' }]}>
                  {item.type === 'income' ? '+' : '-'}₱{item.amount.toFixed(2)}
                </Text>
                <View style={styles.actionButtons}>
                  <Pressable onPress={() => handleEdit(item)}>
                    <Text style={styles.edit}>Edit</Text>
                  </Pressable>
                  <Pressable onPress={() => handleDelete(item.id)}>
                    <Text style={styles.delete}>Delete</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: '#F9FAFB' },
  list:      { padding: 16 },
  empty:     { textAlign: 'center', color: '#aaa', marginTop: 60, fontSize: 15 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
    marginTop: 16,
  },
  modalInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
  },
  modalTextarea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  imageActionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  imageActionBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  removeBtn: {
    backgroundColor: '#FEF2F2',
  },
  imageActionText: {
    color: '#4F46E5',
    fontWeight: '600',
    fontSize: 13,
  },
  removeBtnText: {
    color: '#EF4444',
    fontWeight: '600',
    fontSize: 13,
  },
  addImageBtn: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 12,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  addImageBtnText: {
    color: '#6B7280',
    fontWeight: '600',
    fontSize: 14,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
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
  card:      { backgroundColor: '#fff', borderRadius: 12, marginBottom: 10, overflow: 'hidden',
               borderWidth: 1, borderColor: '#E5E7EB' },
  cardImage: { width: '100%', height: 150 },
  cardContent: { padding: 16, flexDirection: 'row', justifyContent: 'space-between' },
  cardLeft:  { flex: 1 },
  cardRight: { alignItems: 'flex-end' },
  category:  { fontWeight: '700', fontSize: 15, color: '#1a1a2e' },
  note:      { fontSize: 13, color: '#888', marginTop: 2 },
  date:      { fontSize: 12, color: '#aaa', marginTop: 4 },
  amount:    { fontWeight: '700', fontSize: 15 },
  actionButtons: { flexDirection: 'row', gap: 12, marginTop: 8 },
  edit:      { color: '#4F46E5', fontSize: 13, fontWeight: '600' },
  delete:    { color: '#EF4444', fontSize: 13, fontWeight: '600' },
});