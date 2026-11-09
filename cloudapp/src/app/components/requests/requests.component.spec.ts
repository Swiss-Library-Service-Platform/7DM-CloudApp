import { configureComponentTest } from '../../testing/component-test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestsComponent } from './requests.component';

describe('RequestsComponent', () => {
  let component: RequestsComponent;
  let fixture: ComponentFixture<RequestsComponent>;

  beforeEach(async () => {
    await configureComponentTest();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('enables sending only with both IDs, valid time, and no request in flight', () => {
    const button = fixture.nativeElement.querySelector('.header-area-main-button');
    component.isTimeValid = true;
    expect(button.disabled).toBeTrue();
    component.inputBoxId = 'TEST-BOX';
    component.inputRequestId = 'TEST-BARCODE';
    fixture.detectChanges();
    expect(button.disabled).toBeFalse();
    component.isSendingRequest = true;
    fixture.detectChanges();
    expect(button.disabled).toBeTrue();
    component.isSendingRequest = false;
    component.isTimeValid = false;
    fixture.detectChanges();
    expect(button.disabled).toBeTrue();
  });

  it('keeps error heading icons square and unclipped, including wrapped messages', () => {
    component.isTimeValid = true;
    component.responseErrorId = 'test-error';
    for (const message of ['Invalid request ID.', 'A longer error message that wraps onto several lines in a narrow panel.']) {
      component.responseErrorMessage = message;
      fixture.nativeElement.style.cssText = 'display:block;width:260px';
      fixture.detectChanges();
      const icon = fixture.nativeElement.querySelector('.request-failed h1 mat-icon');
      const style = getComputedStyle(icon);
      const bounds = icon.getBoundingClientRect();
      expect(bounds.width).toBe(22);
      expect(bounds.height).toBe(22);
      expect(style.lineHeight).toBe('22px');
      expect(style.fontSize).toBe('22px');
      expect(style.flexShrink).toBe('0');
      expect(icon.classList.contains('mat-icon-inline')).toBeFalse();
    }
  });

});
