import { Request } from '../../models/Request.model';
import { configureComponentTest } from '../../testing/component-test-setup';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestInfoComponent } from './request-info.component';

describe('RequestInfoComponent', () => {
  let component: RequestInfoComponent;
  let fixture: ComponentFixture<RequestInfoComponent>;

  beforeEach(async () => {
    await configureComponentTest();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestInfoComponent);
    component = fixture.componentInstance;
    component.request = new Request({ id: 1, type: 'STANDARD', boxLabel: { boxId: 'TEST' } as any });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
