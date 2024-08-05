import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestjsonComponent } from './testjson.component';

describe('TestjsonComponent', () => {
  let component: TestjsonComponent;
  let fixture: ComponentFixture<TestjsonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TestjsonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestjsonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
