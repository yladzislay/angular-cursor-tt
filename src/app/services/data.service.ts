import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, mergeMap } from 'rxjs/operators';

import rawData from '../../assets/data'; // Импортируем сырые данные
import { UserData } from '../models/user-data.interface';

/**
 * Сервис для работы с данными пользователей
 */
@Injectable({
  providedIn: 'root' // Предоставляем сервис на уровне приложения
})
export class DataService {
  /** 
   * Вероятность возникновения ошибки (для демонстрации) 
   * Установите в 0, чтобы отключить имитацию ошибок
   */
  private errorProbability = 0; // 0 = без ошибок, 0.1 = 10% вероятность ошибки

  constructor() { }

  /**
   * Получает массив данных пользователей с имитацией асинхронного запроса.
   * @returns Observable с массивом UserData.
   */
  getData(): Observable<UserData[]> {
    // Преобразуем импортированные данные к нашему интерфейсу
    const users: UserData[] = rawData as UserData[];

    // Имитируем задержку сети от 500 до 1500 мс
    const randomDelay = Math.random() * 1000 + 500;

    // Имитируем случайные ошибки сети (только для демонстрации)
    return of(null).pipe(
      delay(randomDelay),
      mergeMap(() => {
        // Генерируем случайное число от 0 до 1
        const random = Math.random();
        
        // Если случайное число меньше вероятности ошибки, генерируем ошибку
        if (random < this.errorProbability) {
          return throwError(() => new Error('Ошибка сети при получении данных'));
        }
        
        // Иначе возвращаем данные
        return of(users);
      })
    );
  }
} 