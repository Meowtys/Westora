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
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { getUser, saveUser } from '../storage/storage';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Login'> };

const { width } = Dimensions.get('window');

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
      {/* Main content */}
      <View style={styles.container}>
        {/* Logo */}
        <Image
          source={require('../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Welcome text */}
        <Text style={styles.welcomeText}>Welcome to</Text>
        <Text style={styles.brandName}>Westora</Text>

        {/* Tagline */}
        <View style={styles.taglineRow}>
          <View style={styles.taglineLine} />
          <Text style={styles.tagline}>Track. Plan. Save. Succeed.</Text>
          <View style={styles.taglineLine} />
        </View>

        {/* Inputs */}
        <View style={styles.formContainer}>
          {isNew && (
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

          {/* Login Button */}
          <Pressable style={styles.btn} onPress={handleLogin}>
            <Text style={styles.btnText}>{isNew ? 'Create Account' : 'Login'}</Text>
          </Pressable>
        </View>
      </View>

      {/* Bottom decorative area */}
      <View style={styles.bottomDecor}>
        {/* Wave shape simulation */}
        <View style={styles.wave} />

        {/* Chart bars */}
        <View style={styles.chartArea}>
          <View style={[styles.bar, { height: 60 }]} />
          <View style={[styles.bar, { height: 90 }]} />
          <View style={[styles.bar, { height: 120 }]} />
        </View>

        {/* Dot on line */}
        <View style={styles.dotLine} />
        <View style={styles.dot} />
      </View>

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
  btnIcon: {
    fontSize: 18,
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  bottomDecor: {
    height: 180,
    overflow: 'hidden',
    position: 'relative',
  },
  wave: {
    position: 'absolute',
    bottom: 0,
    left: -20,
    right: -20,
    height: 160,
    backgroundColor: '#D8EEF0',
    borderTopLeftRadius: 80,
    borderTopRightRadius: 120,
  },
  chartArea: {
    position: 'absolute',
    bottom: 40,
    right: 24,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  bar: {
    width: 36,
    backgroundColor: '#A8D8DC',
    borderRadius: 6,
    opacity: 0.7,
  },
  dotLine: {
    position: 'absolute',
    bottom: 100,
    right: 40,
    width: 140,
    height: 1.5,
    backgroundColor: '#2ECC9A',
    transform: [{ rotate: '-20deg' }],
  },
  dot: {
    position: 'absolute',
    bottom: 108,
    right: 160,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2ECC9A',
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
});
