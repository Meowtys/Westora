import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './src/types';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import AddTransactionScreen from './src/screens/AddTransactionScreen';
import TransactionListScreen from './src/screens/TransactionListScreen';
import MonthlySummaryScreen from './src/screens/MonthlySummaryScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen}/>
        <Stack.Screen name="AddTransaction" component={AddTransactionScreen} options={{ title: 'Add Transaction' }} />
        <Stack.Screen name="TransactionList" component={TransactionListScreen} options={{ title: 'Transactions' }} />
        <Stack.Screen name="MonthlySummary" component={MonthlySummaryScreen} options={{ title: 'Monthly Summary' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
