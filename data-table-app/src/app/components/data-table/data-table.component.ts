import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { Subscription } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

import { DataService } from '../../services/data.service';
import { UserData } from '../../models/user-data.interface';

/**
 * Интерфейс для описания колонки таблицы
 */
interface TableColumn {
  id: string;
  name: string;
  visible: boolean;
}

/**
 * Интерфейс для настройки фильтра
 */
interface FilterOptions {
  column: string;
  value: string;
}

/**
 * Компонент для отображения и управления функциональной таблицей данных
 */
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
    MatTooltipModule,
    MatChipsModule,
    MatMenuModule,
    MatCheckboxModule,
    MatDividerModule,
    MatCardModule
  ],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss'
})
export class DataTableComponent implements OnInit, AfterViewInit, OnDestroy {
  /**
   * Все доступные колонки таблицы
   */
  allColumns: TableColumn[] = [
    { id: 'isActive', name: 'Статус', visible: true },
    { id: 'name', name: 'Имя', visible: true },
    { id: 'age', name: 'Возраст', visible: true },
    { id: 'company', name: 'Компания', visible: true },
    { id: 'email', name: 'Email', visible: true },
    { id: 'balance', name: 'Баланс', visible: true },
    { id: 'address', name: 'Адрес', visible: true },
    { id: 'favoriteFruit', name: 'Любимый фрукт', visible: true },
    { id: 'tags', name: 'Теги', visible: true }
  ];
  
  /**
   * Колонки, отображаемые в данный момент
   */
  displayedColumns: string[] = this.getVisibleColumns();
  
  /**
   * Источник данных для таблицы
   */
  dataSource = new MatTableDataSource<UserData>([]);
  
  /**
   * Флаг загрузки данных
   */
  isLoading = false;

  /**
   * Сообщение об ошибке, если загрузка данных не удалась
   */
  errorMessage: string | null = null;

  /**
   * Поле, по которому фильтруем (по умолчанию - все поля)
   */
  filterColumn: string = 'all';
  
  /**
   * Значение фильтра
   */
  filterValue: string = '';

  /**
   * Настройки пагинации
   */
  pageSizeOptions: number[] = [5, 10, 25, 50, 100];
  pageSize: number = 10;
  pageIndex: number = 0;
  totalRows: number = 0;
  showFirstLastButtons: boolean = true;

  /**
   * Подписки на асинхронные операции
   */
  private subscriptions = new Subscription();

  /**
   * Ссылки на пагинатор и сортировщик
   */
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  /**
   * Список полей для фильтрации
   */
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

  Math = Math; // Делаем Math доступным в шаблоне

  /** Флаг, указывающий, является ли текущий экран мобильным */
  isMobile = false;
  
  /** Колонки, скрываемые на мобильных устройствах */
  mobileHiddenColumns = ['address', 'favoriteFruit', 'tags'];
  
  /** Оригинальные настройки колонок (до применения адаптивности) */
  private originalColumnSettings: {id: string, visible: boolean}[] = [];

  constructor(
    private dataService: DataService,
    private breakpointObserver: BreakpointObserver
  ) {
    // Сохраняем оригинальные настройки колонок
    this.originalColumnSettings = this.allColumns.map(col => ({...col}));
  }

  /**
   * Инициализация компонента
   */
  ngOnInit(): void {
    this.loadData();
    this.configureCustomSorting();
    this.configureCustomFiltering();
    this.setupResponsiveness();
  }

  /**
   * После инициализации представления, подключаем сортировку и пагинацию
   */
  ngAfterViewInit(): void {
    // Подключение будет выполнено после загрузки данных в loadData
  }

  /**
   * Очистка ресурсов при уничтожении компонента
   */
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * Загружает данные из сервиса и настраивает dataSource
   */
  loadData(): void {
    this.isLoading = true;
    this.errorMessage = null;
    
    const dataSubscription = this.dataService.getData()
      .pipe(
        catchError(error => {
          this.errorMessage = 'Произошла ошибка при загрузке данных. Пожалуйста, попробуйте позже.';
          return throwError(() => error);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (data) => {
          this.dataSource.data = data;
          this.totalRows = data.length;
          
          // После получения данных подключаем пагинатор и сортировщик
          setTimeout(() => {
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
          });
        },
        error: (err) => {
          console.error('Ошибка при получении данных:', err);
        }
      });
    
    this.subscriptions.add(dataSubscription);
  }

  /**
   * Перезагружает данные
   */
  reloadData(): void {
    this.loadData();
  }

  /**
   * Возвращает массив идентификаторов видимых колонок
   */
  private getVisibleColumns(): string[] {
    return this.allColumns
      .filter(column => column.visible)
      .map(column => column.id);
  }

  /**
   * Обновляет массив отображаемых колонок на основе выбора пользователя
   */
  updateDisplayedColumns(): void {
    this.displayedColumns = this.getVisibleColumns();
  }

  /**
   * Показать/скрыть все колонки
   * @param show Показать все колонки (true) или скрыть все (false)
   */
  toggleAllColumns(show: boolean): void {
    // Если пытаемся скрыть все колонки, оставляем хотя бы одну видимой
    if (!show) {
      const visibleColumnsCount = this.allColumns.filter(col => col.visible).length;
      if (visibleColumnsCount <= 1) {
        return;
      }
    }
    
    this.allColumns.forEach(column => column.visible = show);
    this.updateDisplayedColumns();
  }

  /**
   * Обработчик изменения видимости колонки
   * @param columnId Идентификатор колонки
   * @param event Событие изменения
   */
  toggleColumn(columnId: string, event: any): void {
    // Проверяем, не пытается ли пользователь скрыть последнюю видимую колонку
    if (!event.checked) {
      const visibleColumnsCount = this.allColumns.filter(col => col.visible).length;
      if (visibleColumnsCount <= 1) {
        return;
      }
    }
    
    // Найти колонку в массиве и обновить её видимость
    const column = this.allColumns.find(col => col.id === columnId);
    if (column) {
      column.visible = event.checked;
      this.updateDisplayedColumns();
    }
    
    // Предотвращаем закрытие меню при клике на чекбокс
    event.stopPropagation();

    // Обновляем оригинальные настройки при явном изменении пользователем
    const originalColIndex = this.originalColumnSettings.findIndex(c => c.id === columnId);
    if (originalColIndex >= 0) {
      this.originalColumnSettings[originalColIndex].visible = event.checked;
    }
  }

  /**
   * Восстанавливает стандартный набор колонок
   */
  resetColumnsToDefault(): void {
    // Установим видимыми все колонки по умолчанию
    this.allColumns.forEach(column => column.visible = true);
    this.updateDisplayedColumns();

    // Обновляем оригинальные настройки
    this.originalColumnSettings.forEach(col => {
      col.visible = true;
    });
    
    // Применяем адаптивность после сброса
    this.updateResponsiveColumnVisibility();
  }

  /**
   * Обработчик события изменения страницы
   * @param event Событие пагинации
   */
  handlePageEvent(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
  }

  /**
   * Переход на первую страницу
   */
  goToFirstPage(): void {
    this.paginator.firstPage();
  }

  /**
   * Переход на последнюю страницу
   */
  goToLastPage(): void {
    const lastPageIndex = Math.ceil(this.totalRows / this.pageSize) - 1;
    this.paginator.pageIndex = lastPageIndex;
    this.paginator._changePageSize(this.pageSize);
  }

  /**
   * Возвращает текущий диапазон отображаемых записей (например, "1-10 из 100")
   */
  getCurrentRange(): string {
    if (this.totalRows === 0) {
      return '0-0 из 0';
    }
    
    const start = this.pageIndex * this.pageSize + 1;
    const end = Math.min((this.pageIndex + 1) * this.pageSize, this.totalRows);
    return `${start}-${end} из ${this.totalRows}`;
  }

  /**
   * Настраивает кастомную логику сортировки для обработки сложных структур данных
   * 
   * Этот метод:
   * 1. Позволяет сортировать по вложенным полям (например, name.first + name.last)
   * 2. Конвертирует boolean значения в числа для корректной сортировки
   * 3. Обрабатывает строки с валютой, удаляя специальные символы ($, ,)
   * 4. Преобразует массивы в строки для возможности сортировки
   */
  configureCustomSorting(): void {
    // Настройка доступа к вложенным полям для сортировки
    this.dataSource.sortingDataAccessor = (item: UserData, property: string) => {
      switch (property) {
        case 'name': 
          // Для имени объединяем имя и фамилию
          return `${item.name.first} ${item.name.last}`;
        case 'isActive': 
          // Для логических значений преобразуем в числа (true = 1, false = 0)
          return item.isActive ? 1 : 0;
        case 'balance': 
          // Для денежных значений удаляем символ валюты и запятые
          return parseFloat(item.balance.replace('$', '').replace(',', ''));
        case 'tags': 
          // Для массива тегов объединяем их в одну строку
          return item.tags.join(' ');
        default: 
          // Для других полей используем значение напрямую
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
    const filterOptions: FilterOptions = {
      column: this.filterColumn,
      value: this.filterValue.trim().toLowerCase()
    };
    
    this.dataSource.filter = JSON.stringify(filterOptions);

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
   * Настраивает кастомную логику фильтрации с возможностью выбора поля
   * 
   * Эта функция:
   * 1. Обрабатывает JSON-структуру фильтра (поле + значение)
   * 2. Поддерживает фильтрацию по всем полям или по конкретно выбранному
   * 3. Особым образом обрабатывает boolean поля (активен/неактивен)
   * 4. Выполняет поиск в массивах (теги)
   * 5. Безопасно обрабатывает ошибки парсинга JSON
   */
  configureCustomFiltering(): void {
    // Настройка кастомной функции фильтрации с поддержкой выбора поля
    this.dataSource.filterPredicate = (data: UserData, filterStr: string) => {
      try {
        // Разбираем строку фильтра, которую мы установили в JSON формате
        const filterOptions: FilterOptions = JSON.parse(filterStr);
        const column = filterOptions.column;
        const value = filterOptions.value.toLowerCase();
        
        if (!value) return true; // Пустой фильтр = показать все
        
        // Фильтрация по выбранному полю
        switch (column) {
          case 'all':
            // Для опции "Все поля" проверяем совпадение в любом из полей
            return this.matchesAllFields(data, value);
          
          case 'name':
            // Для имени объединяем имя и фамилию
            return `${data.name.first} ${data.name.last}`.toLowerCase().includes(value);
          
          case 'isActive':
            // Для логических полей "активен"/"неактивен" проверяем вхождение текста
            const statusText = data.isActive ? 'активен' : 'неактивен';
            return statusText.includes(value);
          
          case 'tags':
            // Для массива тегов ищем совпадение в любом из элементов
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
  
  /**
   * Проверяет совпадение значения фильтра с любым из полей записи
   * @param data Проверяемая запись
   * @param value Значение фильтра
   * @returns true, если значение найдено в любом из полей
   */
  private matchesAllFields(data: UserData, value: string): boolean {
    return `${data.name.first} ${data.name.last}`.toLowerCase().includes(value) ||
      data.company.toLowerCase().includes(value) ||
      data.email.toLowerCase().includes(value) ||
      data.address.toLowerCase().includes(value) ||
      data.favoriteFruit.toLowerCase().includes(value) ||
      data.tags.some(tag => tag.toLowerCase().includes(value));
  }

  /**
   * Настройка адаптивности в зависимости от размера экрана
   */
  setupResponsiveness(): void {
    // Подписываемся на изменения размера экрана
    const layoutChanges = this.breakpointObserver.observe([
      Breakpoints.HandsetPortrait,
      Breakpoints.TabletPortrait
    ]).subscribe(result => {
      this.isMobile = result.matches;
      
      // Обновляем видимость колонок в зависимости от размера экрана
      this.updateResponsiveColumnVisibility();
    });
    
    this.subscriptions.add(layoutChanges);
  }
  
  /**
   * Обновляет видимость колонок в зависимости от размера экрана
   */
  updateResponsiveColumnVisibility(): void {
    // Восстанавливаем оригинальные настройки колонок
    this.allColumns.forEach((col, index) => {
      col.visible = this.originalColumnSettings[index].visible;
    });
    
    // На мобильных устройствах скрываем определенные колонки
    if (this.isMobile) {
      this.allColumns.forEach(col => {
        if (this.mobileHiddenColumns.includes(col.id)) {
          col.visible = false;
        }
      });
    }
    
    // Обновляем отображаемые колонки
    this.updateDisplayedColumns();
  }
} 