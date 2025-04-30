import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { finalize, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

// DevExtreme импорты
import { DxDataGridModule, DxButtonModule, DxLoadIndicatorModule, DxDataGridComponent } from 'devextreme-angular';
import { Column as DxColumn } from 'devextreme/ui/data_grid';
// Импортируем тип для mode
import { ColumnChooserMode } from 'devextreme/ui/data_grid';

// Импорт сервиса данных
import { DataService } from '../../services/data.service';
import { UserData } from '../../models/user-data.interface';

@Component({
  selector: 'app-dx-data-table',
  standalone: true,
  imports: [
    CommonModule,
    DxDataGridModule,
    DxButtonModule,
    DxLoadIndicatorModule
  ],
  templateUrl: './dx-data-table.component.html',
  styleUrls: ['./dx-data-table.component.scss']
})
export class DxDataTableComponent implements OnInit, OnDestroy {
  // Данные для таблицы
  userData: UserData[] = [];
  
  // Флаги состояния
  isLoading = false;
  errorMessage: string | null = null;
  
  // Настройки колонок
  columns: DxColumn[] = [
    { 
      dataField: 'isActive', 
      caption: 'Статус', 
      dataType: 'boolean', 
      width: 100,
      lookup: {
        dataSource: [
          { value: true, text: 'Активен' },
          { value: false, text: 'Неактивен' }
        ],
        valueExpr: 'value',
        displayExpr: 'text'
      }
    },
    { 
      dataField: 'name', 
      caption: 'Имя',
      width: 160,
      calculateCellValue: (data: UserData) => {
        if (data && data.name) {
          const firstName = data.name.first || '';
          const lastName = data.name.last || '';
          return `${firstName} ${lastName}`.trim();
        }
        return '';
      }
    },
    { dataField: 'age', caption: 'Возраст', dataType: 'number', width: 100 },
    { dataField: 'company', caption: 'Компания', width: 150 },
    { dataField: 'email', caption: 'Email', width: 200 },
    { dataField: 'balance', caption: 'Баланс', width: 120 },
    { dataField: 'address', caption: 'Адрес', width: 300 },
    { dataField: 'favoriteFruit', caption: 'Любимый фрукт', width: 150 },
    { 
      dataField: 'tags', 
      caption: 'Теги',
      width: 200,
      calculateCellValue: (data: UserData) => {
        if (data && data.tags && Array.isArray(data.tags)) {
          return data.tags.join(', ');
        }
        return '';
      }
    }
  ];
  
  // Настройки для отображения статуса
  statusDisplayValues = {
    true: 'Активен',
    false: 'Неактивен'
  };
  
  // Опции DataGrid
  dataGridOptions = {
    showBorders: true,
    rowAlternationEnabled: true,
    allowColumnReordering: true,
    allowColumnResizing: true,
    columnAutoWidth: false,
    showColumnLines: true,
    showRowLines: true,
    hoverStateEnabled: true,
    
    // Настройки панели поиска
    searchPanel: {
      visible: true,
      width: 300,
      placeholder: 'Поиск...'
    },
    
    // Настройки пагинации
    paging: {
      pageSize: 10
    },
    pager: {
      showPageSizeSelector: true,
      allowedPageSizes: [5, 10, 20, 50],
      showInfo: true
    },
    
    // Настройки сортировки
    sorting: {
      mode: 'multiple'
    },
    
    // Настройки фильтрации
    filterRow: {
      visible: true,
      applyFilter: 'auto'
    },
    
    // Настройки выбора колонок
    columnChooser: {
      enabled: true,
      mode: 'select' as ColumnChooserMode // используем type assertion для указания правильного типа
    },
    
    // Настройки заголовка
    headerFilter: {
      visible: true
    },
    
    // Добавим скроллбар по горизонтали
    columnFixing: {
      enabled: true
    },
    
    // Фиксированная высота для лучшего UX
    height: 'calc(100vh - 150px)',
    
    // Добавим экспорт данных
    export: {
      enabled: true,
      allowExportSelectedData: true
    },
    
    // Адаптация к ширине экрана
    adaptColumnWidthByRatio: true,
  };
  
  private subscriptions = new Subscription();

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

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
          this.userData = data;
        },
        error: (err) => {
          console.error('Ошибка при получении данных:', err);
        }
      });
    
    this.subscriptions.add(dataSubscription);
  }

  reloadData(): void {
    this.loadData();
  }

  // Метод для отображения статуса (Активен/Неактивен)
  formatStatus(isActive: boolean): string {
    return isActive ? 'Активен' : 'Неактивен';
  }
}