import { TestBed } from '@angular/core/testing';

import { AppointmentModalService } from './appointment-modal.service';

describe('AppointmentModalService', () => {
  let service: AppointmentModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppointmentModalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
