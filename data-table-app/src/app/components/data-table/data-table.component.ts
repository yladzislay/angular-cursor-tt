import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

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
    MatProgressSpinnerModule
  ],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss'
})
export class DataTableComponent implements OnInit {
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
  }

  /**
   * Загружает данные из сервиса и настраивает dataSource
   */
  loadData(): void {
    this.isLoading = true;
    
    this.dataService.getData().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        
        // После получения данных пагинатор и сортировщик могут быть инициализированы
        // (они будут доступны после ngAfterViewInit)
        setTimeout(() => {
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;

          // Настройка доступа к вложенным полям для сортировки
          this.dataSource.sortingDataAccessor = (item: UserData, property: string) => {
            switch (property) {
              case 'name': return `${item.name.first} ${item.name.last}`;
              default: return (item as any)[property];
            }
          };

          // Настройка кастомной функции фильтрации
          this.dataSource.filterPredicate = (data: UserData, filter: string) => {
            const filterValue = filter.trim().toLowerCase();
            
            const nameMatch = `${data.name.first} ${data.name.last}`.toLowerCase().includes(filterValue);
            const companyMatch = data.company.toLowerCase().includes(filterValue);
            const emailMatch = data.email.toLowerCase().includes(filterValue);
            const addressMatch = data.address.toLowerCase().includes(filterValue);
            const tagsMatch = data.tags.some(tag => tag.toLowerCase().includes(filterValue));
            
            return nameMatch || companyMatch || emailMatch || addressMatch || tagsMatch;
          };
          
          this.isLoading = false;
        });
      },
      error: (err) => {
        console.error('Ошибка при получении данных:', err);
        this.isLoading = false;
      }
    });
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
} 