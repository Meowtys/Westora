import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  Image,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { getUsers, addUser, removeUser, setCurrentUser, UserAccount } from '../storage/storage';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Login'> };

Dimensions.get('window');

export default function LoginScreen({ navigation }: Props) {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(true);
  const [showSwitchModal, setShowSwitchModal] = useState(false);

  // Load users when screen mounts
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const savedUsers = await getUsers();
    setUsers(savedUsers);
    
    if (savedUsers.length > 0) {
      setIsCreatingNew(false);
      setSelectedUser(savedUsers[savedUsers.length - 1]); // Default to the most recently created account
    } else {
      setIsCreatingNew(true);
      setSelectedUser(null);
    }
  };

  const handleAuth = async () => {
    if (isCreatingNew) {
      if (!name.trim() || pin.length < 4) {
        Alert.alert('Error', 'Enter a name and a 4-digit PIN.');
        return;
      }
      // Create new user account and set it as active session
      const newUser = await addUser(name.trim(), pin);
      await setCurrentUser(newUser);
      navigation.replace('Home');
    } else {
      if (selectedUser && pin === selectedUser.pin) {
        // Authenticate existing account and set active session
        await setCurrentUser(selectedUser);
        navigation.replace('Home');
      } else {
        Alert.alert('Wrong PIN', 'Please try again.');
        setPin(''); // Clear PIN field on failure
      }
    }
  };

  const handleDeleteUser = (id: string, userName: string) => {
    Alert.alert('Delete Account', `Are you sure you want to remove ${userName}? This will not erase overall application data.`, [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive', 
        onPress: async () => {
          await removeUser(id);
          const updatedUsers = await getUsers();
          setUsers(updatedUsers);
          
          if (updatedUsers.length === 0) {
            setShowSwitchModal(false);
            setIsCreatingNew(true);
            setSelectedUser(null);
          } else if (selectedUser?.id === id) {
            // If we deleted the user currently active on the login view, pick the next available one
            setSelectedUser(updatedUsers[0]);
          }
        }
      }
    ]);
  };

  const handleSelectUser = (user: UserAccount) => {
    setSelectedUser(user);
    setIsCreatingNew(false);
    setShowSwitchModal(false);
    setPin('');
  };

  const handleCreateNewFromModal = () => {
    setIsCreatingNew(true);
    setSelectedUser(null);
    setName('');
    setPin('');
    setShowSwitchModal(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <View style={styles.container}>
          {/* Logo */}
          <Image
            source={require('../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          {/* Dynamic Greeting Text */}
          <Text style={styles.welcomeText}>
            {isCreatingNew ? 'Welcome to' : 'Welcome back,'}
          </Text>
          <Text style={styles.brandName} numberOfLines={1} ellipsizeMode="tail">
            {isCreatingNew ? 'Westora' : selectedUser?.name}
          </Text>

          {/* Tagline */}
          <View style={styles.taglineRow}>
            <View style={styles.taglineLine} />
            <Text style={styles.tagline}>Track. Plan. Save. Succeed.</Text>
            <View style={styles.taglineLine} />
          </View>

          {/* Form Inputs */}
          <View style={styles.formContainer}>
            {isCreatingNew && (
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>👤</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Your Name"
                  placeholderTextColor="#aaa"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            )}

            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="4-digit PIN"
                placeholderTextColor="#aaa"
                value={pin}
                onChangeText={setPin}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
              />
            </View>

            {/* Form Submit Button */}
            <Pressable style={styles.btn} onPress={handleAuth}>
              <Text style={styles.btnText}>{isCreatingNew ? 'Create Account' : 'Login'}</Text>
            </Pressable>

            {/* Switch Account Button */}
            {users.length > 0 && (
              <Pressable style={styles.switchBtn} onPress={() => setShowSwitchModal(true)}>
                <Text style={styles.switchBtnText}>Switch Account</Text>
              </Pressable>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Account List Modal */}
      <Modal
        visible={showSwitchModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSwitchModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Account</Text>
            
            <FlatList
              data={users}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.userList}
              renderItem={({ item }) => (
                <View style={[
                  styles.userCard, 
                  selectedUser?.id === item.id && styles.userCardActive
                ]}>
                  <Pressable 
                    style={styles.userInfo} 
                    onPress={() => handleSelectUser(item)}
                  >
                    <Text style={styles.userAvatar}>👤</Text>
                    <Text style={styles.userName} numberOfLines={1}>{item.name}</Text>
                  </Pressable>
                  
                  <Pressable 
                    style={styles.deleteBtn}
                    onPress={() => handleDeleteUser(item.id, item.name)}
                  >
                    <Text style={styles.deleteBtnText}>🗑️</Text>
                  </Pressable>
                </View>
              )}
            />

            <Pressable style={styles.createNewBtn} onPress={handleCreateNewFromModal}>
              <Text style={styles.createNewBtnText}>+ Add New Account</Text>
            </Pressable>

            <Pressable style={styles.closeModalBtn} onPress={() => setShowSwitchModal(false)}>
              <Text style={styles.closeModalText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerIcon}>🛡️</Text>
        <Text style={styles.footerText}>Your data is secure</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#EEF0F8',
  },
  keyboardAvoid: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#444',
    marginBottom: 4,
  },
  brandName: {
    fontSize: 48,
    fontWeight: '800',
    color: '#1a5c5a',
    marginBottom: 12,
    maxWidth: '100%',
    textAlign: 'center',
  },
  taglineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 32,
  },
  taglineLine: {
    height: 1.5,
    width: 30,
    backgroundColor: '#2ECC9A',
  },
  tagline: {
    fontSize: 13,
    color: '#888',
    letterSpacing: 0.3,
  },
  formContainer: {
    width: '100%',
    gap: 14,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  inputIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  btn: {
    flexDirection: 'row',
    backgroundColor: '#4F46E5',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  switchBtn: {
    alignItems: 'center',
    paddingVertical: 8,
    marginTop: 4,
  },
  switchBtnText: {
    color: '#4F46E5',
    fontWeight: '600',
    fontSize: 15,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 16,
    gap: 6,
    backgroundColor: '#EEF0F8',
  },
  footerIcon: {
    fontSize: 14,
  },
  footerText: {
    fontSize: 13,
    color: '#888',
  },
  
  // Modal Style Definitions
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '75%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  userList: {
    gap: 12,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  userCardActive: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatar: {
    fontSize: 20,
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  deleteBtn: {
    padding: 8,
  },
  deleteBtnText: {
    fontSize: 18,
  },
  createNewBtn: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  createNewBtnText: {
    color: '#4F46E5',
    fontWeight: '600',
    fontSize: 15,
  },
  closeModalBtn: {
    marginTop: 12,
    padding: 16,
    alignItems: 'center',
  },
  closeModalText: {
    color: '#6B7280',
    fontWeight: '600',
    fontSize: 15,
  },
});