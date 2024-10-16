import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestSelectionComponent } from './request-selection.component';

describe('RequestSelectionComponent', () => {
  let component: RequestSelectionComponent;
  let fixture: ComponentFixture<RequestSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RequestSelectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
