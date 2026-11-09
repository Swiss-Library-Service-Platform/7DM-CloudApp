import { configureComponentTest } from '../../testing/component-test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodayComponent } from './today.component';

describe('TodayComponent', () => {
  let component: TodayComponent;
  let fixture: ComponentFixture<TodayComponent>;

  beforeEach(async () => {
    await configureComponentTest();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TodayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
