import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppointmentModalService {
  private reloadAppointmentsSubject = new Subject<void>();
  reloadAppointments$ = this.reloadAppointmentsSubject.asObservable();

  private selectedAppointmentSubject = new BehaviorSubject<any>(null);
  selectedAppointment$ = this.selectedAppointmentSubject.asObservable();

  private modalStateSubject = new BehaviorSubject<boolean>(false);
  modalState$ = this.modalStateSubject.asObservable();

  selectAppointment(appointment: any) {
    this.selectedAppointmentSubject.next(appointment);
  }

  getSelectedAppointment(): any {
    return this.selectedAppointmentSubject.getValue();
  }
  
  openModal(): void {
    if (!this.modalStateSubject.getValue()) {
      this.modalStateSubject.next(true);
    } 
  }
  
  closeModal(): void {
    const isModalOpen = this.modalStateSubject.getValue();
    if (isModalOpen) {
      this.modalStateSubject.next(false);
      this.selectedAppointmentSubject.next(null); 
    }
  }
  
  reloadAppointments(): void {
    this.reloadAppointmentsSubject.next();
  }
}
