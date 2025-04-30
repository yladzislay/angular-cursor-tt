import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

import rawData from '../../assets/data'; // Импортируем сырые данные
import { UserData } from '../models/user-data.interface';

@Injectable({
  providedIn: 'root' // Предоставляем сервис на уровне приложения
})
export class DataService {

  constructor() { }

  /**
   * Получает массив данных пользователей с имитацией асинхронного запроса.
   * @returns Observable с массивом UserData.
   */
  getData(): Observable<UserData[]> {
    // Преобразуем импортированные данные к нашему интерфейсу (хотя структура совпадает)
    const users: UserData[] = rawData as UserData[];

    // Имитируем задержку сети от 500 до 1500 мс
    const randomDelay = Math.random() * 1000 + 500;

    return of(users).pipe(
      delay(randomDelay)
    );
  }
} 