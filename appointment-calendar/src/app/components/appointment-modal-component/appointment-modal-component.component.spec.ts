import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentModalComponentComponent } from './appointment-modal-component.component';

describe('AppointmentModalComponentComponent', () => {
  let component: AppointmentModalComponentComponent;
  let fixture: ComponentFixture<AppointmentModalComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentModalComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppointmentModalComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
