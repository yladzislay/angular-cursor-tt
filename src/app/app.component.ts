import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DxDataTableComponent } from './components/dx-data-table/dx-data-table.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    DxDataTableComponent,
    MatIconModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'dx-data-table';
}
