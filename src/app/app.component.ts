import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';

import { DataTableComponent } from './components/data-table/data-table.component';
import { DxDataTableComponent } from './components/dx-data-table/dx-data-table.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    DataTableComponent,
    DxDataTableComponent,
    FormsModule,
    MatButtonToggleModule,
    MatCardModule,
    MatToolbarModule,
    MatIconModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  currentTable: 'material' | 'devextreme' = 'devextreme';

  switchTable(tableType: 'material' | 'devextreme'): void {
    this.currentTable = tableType;
  }
}
