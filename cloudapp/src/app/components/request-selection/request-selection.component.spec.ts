import { configureComponentTest } from '../../testing/component-test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestSelectionComponent } from './request-selection.component';

describe('RequestSelectionComponent', () => {
  let component: RequestSelectionComponent;
  let fixture: ComponentFixture<RequestSelectionComponent>;

  beforeEach(async () => {
    await configureComponentTest();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('updates selection and emits through the Material checkbox', async () => {
    const selected = spyOn(component.onSelectAll, 'emit');
    fixture.nativeElement.querySelector('input[type="checkbox"]').click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.allSelected).toBeTrue();
    expect(selected).toHaveBeenCalledTimes(1);
  });

});
