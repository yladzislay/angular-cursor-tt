export interface UserData {
  _id: string;
  isActive: boolean;
  balance: string; // Оставляем строкой, т.к. содержит символ $ и запятые
  picture: string;
  age: number;
  name: {
    first: string;
    last: string;
  };
  company: string;
  email: string;
  address: string;
  tags: string[];
  favoriteFruit: string;
} 