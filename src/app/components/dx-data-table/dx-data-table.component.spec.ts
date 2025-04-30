import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DxDataTableComponent } from './dx-data-table.component';

describe('DxDataTableComponent', () => {
  let component: DxDataTableComponent;
  let fixture: ComponentFixture<DxDataTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DxDataTableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DxDataTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
