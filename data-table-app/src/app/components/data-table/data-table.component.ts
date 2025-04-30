import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

import { DataService } from '../../services/data.service';
import { UserData } from '../../models/user-data.interface';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatSelectModule,
    MatButtonModule,
    MatTooltipModule
  ],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss'
})
export class DataTableComponent implements OnInit, AfterViewInit {
  // Столбцы, которые будут отображаться в таблице
  displayedColumns: string[] = [
    'isActive', 
    'name',
    'age',
    'company',
    'email',
    'balance',
    'address',
    'favoriteFruit',
    'tags'
  ];
  
  // Источник данных для MatTable
  dataSource = new MatTableDataSource<UserData>([]);
  
  // Флаг загрузки данных
  isLoading = true;

  // Поле, по которому фильтруем (по умолчанию - все поля)
  filterColumn: string = 'all';
  
  // Значение фильтра
  filterValue: string = '';

  // Ссылки на пагинатор и сортировщик
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Список полей для фильтрации
  filterColumns = [
    { value: 'all', viewValue: 'Все поля' },
    { value: 'name', viewValue: 'Имя' },
    { value: 'company', viewValue: 'Компания' },
    { value: 'email', viewValue: 'Email' },
    { value: 'address', viewValue: 'Адрес' },
    { value: 'favoriteFruit', viewValue: 'Любимый фрукт' },
    { value: 'tags', viewValue: 'Теги' },
    { value: 'isActive', viewValue: 'Статус' },
  ];

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.loadData();
    this.configureCustomSorting();
    this.configureCustomFiltering();
  }

  /**
   * После инициализации представления, подключаем сортировку и пагинацию
   */
  ngAfterViewInit(): void {
    // Подключение будет выполнено после загрузки данных в loadData
  }

  /**
   * Загружает данные из сервиса и настраивает dataSource
   */
  loadData(): void {
    this.isLoading = true;
    
    this.dataService.getData().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        
        // После получения данных подключаем пагинатор и сортировщик
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Ошибка при получении данных:', err);
        this.isLoading = false;
      }
    });
  }

  /**
   * Настраивает кастомную логику сортировки
   */
  configureCustomSorting(): void {
    // Настройка доступа к вложенным полям для сортировки
    this.dataSource.sortingDataAccessor = (item: UserData, property: string) => {
      switch (property) {
        case 'name': 
          return `${item.name.first} ${item.name.last}`;
        case 'isActive': 
          return item.isActive ? 1 : 0; // Преобразуем boolean в числа для сортировки
        case 'balance': 
          // Удаляем '$' и запятые, чтобы получить числовое значение для сортировки
          return parseFloat(item.balance.replace('$', '').replace(',', ''));
        case 'tags': 
          return item.tags.join(' '); // Объединяем теги для сортировки
        default: 
          return (item as any)[property];
      }
    };
  }

  /**
   * Метод для фильтрации данных
   * @param event Событие ввода или null, если вызывается программно
   */
  applyFilter(event: Event | null = null): void {
    if (event) {
      this.filterValue = (event.target as HTMLInputElement).value;
    }
    
    // Установка значения фильтра с сохранением текущего выбранного поля
    this.dataSource.filter = JSON.stringify({
      column: this.filterColumn,
      value: this.filterValue.trim().toLowerCase()
    });

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  /**
   * Метод вызывается при изменении поля для фильтрации
   */
  onFilterColumnChange(): void {
    // Переприменяем текущий фильтр с новым выбранным полем
    this.applyFilter();
  }

  /**
   * Очистка фильтра
   */
  clearFilter(): void {
    this.filterValue = '';
    this.filterColumn = 'all';
    this.dataSource.filter = '';
    
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  /**
   * Настройка кастомной логики фильтрации
   */
  configureCustomFiltering(): void {
    // Настройка кастомной функции фильтрации с поддержкой выбора поля
    this.dataSource.filterPredicate = (data: UserData, filterStr: string) => {
      try {
        // Разбираем строку фильтра, которую мы установили в JSON формате
        const filterObj = JSON.parse(filterStr);
        const column = filterObj.column;
        const value = filterObj.value.toLowerCase();
        
        if (!value) return true; // Пустой фильтр = показать все
        
        // Фильтрация по выбранному полю
        switch (column) {
          case 'all':
            return `${data.name.first} ${data.name.last}`.toLowerCase().includes(value) ||
              data.company.toLowerCase().includes(value) ||
              data.email.toLowerCase().includes(value) ||
              data.address.toLowerCase().includes(value) ||
              data.favoriteFruit.toLowerCase().includes(value) ||
              data.tags.some(tag => tag.toLowerCase().includes(value));
          
          case 'name':
            return `${data.name.first} ${data.name.last}`.toLowerCase().includes(value);
          
          case 'isActive':
            // Для логических полей "активен"/"неактивен" проверяем вхождение текста
            const statusText = data.isActive ? 'активен' : 'неактивен';
            return statusText.includes(value);
          
          case 'tags':
            return data.tags.some(tag => tag.toLowerCase().includes(value));
          
          default:
            // Для всех остальных полей используем стандартную проверку
            return String((data as any)[column]).toLowerCase().includes(value);
        }
      } catch (e) {
        // Если фильтр не в JSON формате (например, пустая строка),
        // просто возвращаем true (показать все)
        return true;
      }
    };
  }
} 