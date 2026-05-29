export type TransactionType = 'income' | 'expense';

export type Transaction = {
  id: string;	
  type: TransactionType;
  amount: number;
  category: string;
  note: string;
  date: string;
  image?: string;
};

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  AddTransaction: undefined;
  TransactionList: undefined;
  MonthlySummary: undefined;
};
