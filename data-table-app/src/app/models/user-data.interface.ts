/**
 * Интерфейс, описывающий данные пользователя
 */
export interface UserData {
  /** Уникальный идентификатор */
  _id: string;
  
  /** Статус активности пользователя */
  isActive: boolean;
  
  /** Баланс пользователя в формате строки (например, '$1,234.56') */
  balance: string;
  
  /** URL изображения пользователя */
  picture: string;
  
  /** Возраст пользователя */
  age: number;
  
  /** Имя пользователя */
  name: {
    /** Имя */
    first: string;
    /** Фамилия */
    last: string;
  };
  
  /** Название компании */
  company: string;
  
  /** Email адрес */
  email: string;
  
  /** Физический адрес */
  address: string;
  
  /** Массив тегов, связанных с пользователем */
  tags: string[];
  
  /** Предпочитаемый фрукт */
  favoriteFruit: string;
} 