import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

import { DataService } from '../../services/data.service';
import { UserData } from '../../models/user-data.interface';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss'
})
export class DataTableComponent implements OnInit, AfterViewInit {
  // Столбцы, которые будут отображаться в таблице
  displayedColumns: string[] = [
    'isActive', 
    'name',       // комбинированное поле name.first + name.last
    'age',
    'company',
    'email',
    'balance',
    'address',
    'favoriteFruit',
    'tags'        // массив тегов
  ];
  
  // Источник данных для MatTable
  dataSource = new MatTableDataSource<UserData>([]);
  
  // Флаг загрузки данных
  isLoading = true;

  // Ссылки на пагинатор и сортировщик
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.loadData();
    
    // Настройка кастомной логики сортировки
    this.configureCustomSorting();
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
   * @param event Событие ввода
   */
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  /**
   * Настройка кастомной логики фильтрации
   */
  configureCustomFiltering(): void {
    // Настройка кастомной функции фильтрации
    this.dataSource.filterPredicate = (data: UserData, filter: string) => {
      const filterValue = filter.trim().toLowerCase();
      
      // Проверяем все поля, которые мы хотим включить в фильтрацию
      return `${data.name.first} ${data.name.last}`.toLowerCase().includes(filterValue) ||
            data.company.toLowerCase().includes(filterValue) ||
            data.email.toLowerCase().includes(filterValue) ||
            data.address.toLowerCase().includes(filterValue) ||
            data.favoriteFruit.toLowerCase().includes(filterValue) ||
            data.tags.some(tag => tag.toLowerCase().includes(filterValue));
    };
  }
} 