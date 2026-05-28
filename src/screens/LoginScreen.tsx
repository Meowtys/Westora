import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { getUser, saveUser } from '../storage/storage';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Login'> };

export default function LoginScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [isNew, setIsNew] = useState(true);

  useEffect(() => {
    getUser().then(user => { if (user) setIsNew(false); });
  }, []);

  const handleLogin = async () => {
    const user = await getUser();
    if (isNew) {
      if (!name.trim() || pin.length < 4) {
        Alert.alert('Error', 'Enter a name and a 4-digit PIN.');
        return;
      }
      await saveUser(name.trim(), pin);
      navigation.replace('Home');
    } else {
      if (user && pin === user.pin) {
        navigation.replace('Home');
      } else {
        Alert.alert('Wrong PIN', 'Please try again.');
      }
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.logo}>Westora</Text>
        <Text style={styles.subtitle}>Student Budget Tracker</Text>
        {isNew && (
          <TextInput style={styles.input} placeholder="Your Name" value={name} onChangeText={setName} />
        )}
        <TextInput style={styles.input} placeholder="4-digit PIN" value={pin}
          onChangeText={setPin} keyboardType="numeric" maxLength={4} secureTextEntry />
        <Pressable style={styles.btn} onPress={handleLogin}>
          <Text style={styles.btnText}>{isNew ? 'Create Account' : 'Login'}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: '#F0F4FF' },
  container: { flex: 1, justifyContent: 'center', padding: 32 },
  logo:      { fontSize: 42, fontWeight: '800', color: '#4F46E5', textAlign: 'center', marginBottom: 8 },
  subtitle:  { fontSize: 16, color: '#888', textAlign: 'center', marginBottom: 40 },
  input:     { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd',
               borderRadius: 12, padding: 14, fontSize: 15, marginBottom: 14 },
  btn:       { backgroundColor: '#4F46E5', padding: 16, borderRadius: 12, alignItems: 'center' },
  btnText:   { color: '#fff', fontWeight: '700', fontSize: 16 },
});
