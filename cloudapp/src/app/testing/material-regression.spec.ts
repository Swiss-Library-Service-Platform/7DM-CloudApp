import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlertService } from '@exlibris/exl-cloudapp-angular-lib';
import { configureComponentTest } from './component-test-setup';

@Component({
  selector: 'app-root',
  template: `<cloudapp-alert></cloudapp-alert>
    <mat-tab-group [mat-stretch-tabs]="true">
      <mat-tab label="Requests"><app-requests></app-requests></mat-tab>
      <mat-tab label="Today">Today content</mat-tab>
      <mat-tab label="History">History content</mat-tab>
    </mat-tab-group>`
})
class MaterialRegressionHost {}

describe('Material upgrade layout and interaction', () => {
  let fixture: ComponentFixture<MaterialRegressionHost>;
  let originalBodyClass: string;
  let appRoot: HTMLElement;
  beforeEach(async () => {
    await configureComponentTest([MaterialRegressionHost]);
    originalBodyClass = document.body.className;
    document.body.classList.add('cloudapp-theme--blue');
    fixture = TestBed.createComponent(MaterialRegressionHost);
    // TestBed uses a div host; reproduce the app-root ancestry used by SDK CSS.
    appRoot = document.createElement('app-root');
    document.body.appendChild(appRoot);
    appRoot.appendChild(fixture.nativeElement);
    fixture.nativeElement.style.cssText = 'display:block;position:relative;width:400px';
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });
  afterEach(() => { document.body.className = originalBodyClass; appRoot.remove(); });

  it('keeps empty alerts out of input hit testing and actual alerts interactive', async () => {
    const alert = fixture.nativeElement.querySelector('cloudapp-alert');
    expect(alert.getBoundingClientRect().height).toBe(0);
    expect(getComputedStyle(alert).pointerEvents).toBe('none');
    const input = fixture.nativeElement.querySelector('input');
    const rect = input.getBoundingClientRect();
    expect(document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)).toBe(input);
    input.focus();
    expect(document.activeElement).toBe(input);
    TestBed.inject(AlertService).error('Test error');
    fixture.detectChanges();
    const message = alert.querySelector('.alert');
    expect(message).not.toBeNull();
    expect(getComputedStyle(message).pointerEvents).toBe('auto');
    message.querySelector('.close').click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(alert.querySelector('.alert')).toBeNull();
  });

  it('keeps equal-width tabs and the underline inset at narrow and wide panel sizes', async () => {
    for (const width of [320, 480]) {
      fixture.nativeElement.style.width = `${width}px`;
      const tabs = Array.from(fixture.nativeElement.querySelectorAll('[role="tab"]')) as HTMLElement[];
      const widths = tabs.map(tab => tab.getBoundingClientRect().width);
      expect(Math.max(...widths) - Math.min(...widths)).toBeLessThan(1);
      for (const tab of tabs) {
        tab.click();
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
        expect(tab.getAttribute('aria-selected')).toBe('true');
        const bounds = tab.getBoundingClientRect();
        const line = tab.querySelector('.mdc-tab-indicator__content--underline').getBoundingClientRect();
        expect(line.left - bounds.left).toBeCloseTo(5, 0);
        expect(bounds.right - line.right).toBeCloseTo(5, 0);
        expect(bounds.bottom - line.bottom).toBeCloseTo(5, 0);
      }
    }
  });

  it('renders transparent fields, readable labels, and a disabled empty submission', () => {
    const field = fixture.nativeElement.querySelector('.mdc-text-field');
    expect(getComputedStyle(field).backgroundColor).toBe('rgba(0, 0, 0, 0)');
    const label = fixture.nativeElement.querySelector('.mdc-floating-label');
    expect(getComputedStyle(label).fontWeight).toBe('400');
    expect(fixture.nativeElement.querySelector('.header-area-main-button').disabled).toBeTrue();
  });
});
