import React, { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, Pressable, StyleSheet, Alert, ScrollView, Image } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
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
  const [customCategory, setCustomCategory] = useState('');
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const [note, setNote] = useState('');
  const [image, setImage] = useState<string | undefined>(undefined);

  const handlePickCategory = (cat: string) => {
    setCategory(cat);
    setIsOtherSelected(cat === 'Other');
  };

  const handleTakePhoto = () => {
    launchCamera({ mediaType: 'photo', saveToPhotos: true }, (response) => {
      if (response.assets && response.assets[0].uri) setImage(response.assets[0].uri);
    });
  };

  const handlePickImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (response.assets && response.assets[0].uri) setImage(response.assets[0].uri);
    });
  };

  const handleRemoveImage = () => setImage(undefined);

  const handleSave = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }
    
    const finalCategory = isOtherSelected ? customCategory : category;
    
    if (!finalCategory.trim()) {
      Alert.alert('Invalid Category', 'Please select or enter a category.');
      return;
    }

    await saveTransaction({
      id: uuid.v4() as string,
      type,
      amount: Number(amount),
      category: finalCategory.trim(),
      note: note.trim(),
      date: new Date().toISOString(),
      image,
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
              onPress={() => handlePickCategory(cat)}>
              <Text style={[styles.catText, category === cat && styles.catTextActive]}>{cat}</Text>
            </Pressable>
          ))}
        </View>

        {isOtherSelected && (
          <TextInput 
            style={[styles.input, { marginTop: 10 }]} 
            placeholder="Enter custom category" 
            value={customCategory} 
            onChangeText={setCustomCategory}
            autoFocus 
          />
        )}

        <Text style={styles.sectionLabel}>Note (optional)</Text>
        <TextInput style={[styles.input, styles.multiline]} placeholder="Add a note..."
          value={note} onChangeText={setNote} multiline />

        <Text style={styles.sectionLabel}>Receipt (optional)</Text>
        <View style={styles.imageButtonsRow}>
          <Pressable style={[styles.imageBtn, styles.cameraBtn]} onPress={handleTakePhoto}>
            <Text style={styles.imageBtnIcon}>📷</Text>
            <Text style={styles.imageBtnText}>Take Photo</Text>
          </Pressable>
          <Pressable style={[styles.imageBtn, styles.galleryBtn]} onPress={handlePickImage}>
            <Text style={styles.imageBtnIcon}>🖼️</Text>
            <Text style={styles.imageBtnText}>Upload</Text>
          </Pressable>
        </View>

        {image && (
          <View style={styles.imagePreview}>
            <Image source={{ uri: image }} style={styles.previewImage} />
            <Pressable onPress={handleRemoveImage}>
              <Text style={styles.removeImageText}>✕ Remove</Text>
            </Pressable>
          </View>
        )}

        <Pressable style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save Transaction</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F0F4FF' },
  container: { padding: 24 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 8, marginTop: 16 },
  row: { flexDirection: 'row', gap: 12 },
  typeBtn: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#ccc', alignItems: 'center' },
  typeBtnActive: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  typeBtnText: { fontWeight: '600', color: '#555' },
  typeBtnTextActive: { color: '#fff' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 15 },
  multiline: { height: 80, textAlignVertical: 'top' },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#ccc', backgroundColor: '#fff' },
  catBtnActive: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  catText: { fontSize: 13, color: '#555' },
  catTextActive: { color: '#fff' },
  imageButtonsRow: { flexDirection: 'row', gap: 12 },
  imageBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1.5, borderStyle: 'dashed' },
  cameraBtn: { borderColor: '#4F46E5', backgroundColor: '#F0F4FF' },
  galleryBtn: { borderColor: '#4F46E5', backgroundColor: '#F0F4FF' },
  imageBtnIcon: { fontSize: 24, marginBottom: 6 },
  imageBtnText: { fontSize: 12, color: '#4F46E5', fontWeight: '600' },
  imagePreview: { marginTop: 16, borderRadius: 12, overflow: 'hidden', backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', padding: 12 },
  previewImage: { width: '100%', height: 200, borderRadius: 8, marginBottom: 8 },
  removeImageText: { fontSize: 13, color: '#EF4444', fontWeight: '600', marginTop: 5 },
  saveBtn: { backgroundColor: '#4F46E5', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 24 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});