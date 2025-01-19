import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';
import { AppointmentService } from '../../services/appointments/appointment.service';
import { ClientService } from '../../services/clients/client.service';
import { ServiceService } from '../../services/services/service.service';
import { ClientModel } from '../../models/client.model';
import { ServiceModel } from '../../models/service.model';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, filter, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AppointmentModalService } from '../../services/apointmentModal/appointment-modal.service';

@Component({
  selector: 'app-appointment-modal-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FullCalendarModule, NgbModalModule],
  templateUrl: './appointment-modal-component.component.html',
  styleUrl: './appointment-modal-component.component.css'
})

export class AppointmentModalComponent implements OnInit {
  @ViewChild('appointmentModal')appointmentModal!: TemplateRef<any>;
  appointmentForm: FormGroup;
  clients: ClientModel[] = [];
  services: ServiceModel[] = [];
  filteredClients: ClientModel[] = [];
  selectedClient: ClientModel | null = null;
  selectedAppointment: any = null;
  hourEnd: string = '';
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  searchQuery: string = '';
  errorMessage: string = '';
  serverValidationErrors: any = {};
  loadingClients: boolean = false;
  private searchSubject = new Subject<string>(); 

  constructor(
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private appointmentService: AppointmentService,
    private clientService: ClientService,
    private serviceService: ServiceService,
    private appointmentModalService: AppointmentModalService,
    private router: Router
  ) {
    this.appointmentForm = this.formBuilder.group({
      client_id: ['', Validators.required],
      services: [[], Validators.required],
      date: ['', Validators.required],
      startTime: ['', Validators.required],
      note: ['', [Validators.maxLength(255)]],
    });

    this.appointmentForm.statusChanges.subscribe(() => {
      if (this.appointmentForm.valid) {
        this.errorMessage = '';
        this.serverValidationErrors = {};
      }
    });

    this.appointmentForm.get('startTime')?.valueChanges.subscribe(() => {
      this.updateHourEnd();
    });
    this.appointmentForm.get('services')?.valueChanges.subscribe(() => {
      this.updateHourEnd();
    });
  }

  ngOnInit(): void {
    this.loadClientsAndServices();
    
    this.appointmentModalService.modalState$
    .pipe(
      distinctUntilChanged(),
      filter((isOpen) => isOpen)
    )
    .subscribe(() => {
      const appointment = this.appointmentModalService.getSelectedAppointment();
      this.selectedAppointment = appointment;
  
      if (appointment) {
        if (appointment.isNew) {
          this.appointmentForm.patchValue({
            date: appointment.date,
            startTime: appointment.startTime,
          });
          this.selectedAppointment = null; 
        } else {
          this.populateFormWithAppointment(appointment);
        }
      } else {
        this.cleandData();
      }
  
      this.openModal();
    });
  
    this.searchSubject.pipe(
      debounceTime(700),
      distinctUntilChanged(), 
      filter(query => query.trim() !== ''), 
      switchMap((query) => {
        return this.clientService.searchClients(query); 
      })
    ).subscribe({
      next: (clients: ClientModel[]) => {
        this.filteredClients = clients; 
        this.loadingClients = false;
      },
      error: (error) => {
        this.handleError(error);
        this.loadingClients = false;
      }
    });
  }

  loadClientsAndServices(): void {
    this.clientService.getClients().subscribe({
      next: (clients: ClientModel[]) => {
        this.clients = clients;
        this.filteredClients = clients;
      },
      error: (error) => this.handleError(error),
    });

    this.serviceService.getAllServices().subscribe({
      next: (services: ServiceModel[]) => {
        this.services = services;
      },
      error: (error) => this.handleError(error),
    });
  }

  searchClients(event: Event) {
    this.loadingClients = true; 
    const inputElement = event.target as HTMLInputElement;
    const query = inputElement.value.trim();
    this.searchQuery = query; 
    if ( this.searchQuery === '') {
      this.filteredClients = [];
      this.loadingClients = false;
    }
    this.searchSubject.next(query);
  }

  saveAppointment(): void {
    this.isSubmitting = true;

    if (this.appointmentForm.valid) {
      this.isLoading = true;
      const appointmentData = this.appointmentForm.value;

      const observer = {
        next: () => {
          this.close();
          this.appointmentModalService.reloadAppointments();
        },
        error: (error: any) => {
          this.handleError(error);
          this.isLoading = false; 
          this.isSubmitting = false;
        },
        complete: () => {
          this.isLoading = false; 
          this.isSubmitting = false;
        },
      };

      if (this.selectedAppointment && this.selectedAppointment.appointment_id) {
        this.appointmentService
          .updateAppointment(this.selectedAppointment.appointment_id, appointmentData)
          .subscribe(observer);
      } else {
        this.appointmentService.createAppointment(appointmentData).subscribe(observer);
      }
    } else {
      this.errorMessage = 'Por favor, completa los campos requeridos correctamente.';
    }
  }

  deleteAppointment(): void {
    const appointmentId = this.selectedAppointment?.appointment_id;
    if (appointmentId && confirm('¿Estás seguro de que deseas eliminar esta cita?')) {
      this.isLoading = true;
      this.appointmentService.deleteAppointment(appointmentId).subscribe({
        next: () => {
          this.close();
          this.appointmentModalService.reloadAppointments();
        },
        error: (error) => {
          this.handleError(error);
          this.isLoading = false;
        },
        complete: () => (this.isLoading = false),
      });
    }
  }

  toggleService(serviceId: number): void {
    const selectedServices: number[] = this.appointmentForm.get('services')?.value || [];
    const serviceSet = new Set(selectedServices);

    if (serviceSet.has(serviceId)) {
      serviceSet.delete(serviceId);
    } else {
      serviceSet.add(serviceId);
    }

    this.appointmentForm.patchValue({ services: Array.from(serviceSet) });
  }

  selectClient(client: ClientModel): void {
    this.selectedClient = client;
    this.appointmentForm.patchValue({ client_id: client.id });
    this.filteredClients = [];
    this.searchQuery = '';
  }

  updateHourEnd(): void {
    const startTime = this.appointmentForm.get('startTime')?.value;
    const selectedServices = this.appointmentForm.get('services')?.value;

    if (startTime && selectedServices?.length > 0) {
      const totalDuration = selectedServices
        .map((serviceId: number) => this.services.find(service => service.id === serviceId)?.duration || 0)
        .reduce((acc: number, duration: number) => acc + duration, 0);

      this.hourEnd = this.addMinutesToTime(startTime, totalDuration);
    } else {
      this.hourEnd = '';
    }
  }

  addMinutesToTime(startTime: string, minutes: number): string {
    const [hours, mins] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMinutes = totalMinutes % 60;

    return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
  }

  populateFormWithAppointment(appointment: any): void {
      this.appointmentForm.patchValue({
        client_id: appointment.client_id,
        services: appointment.services,
        date: appointment.date,
        startTime: appointment.startTime,
        note: appointment.note,
      });
      this.selectedClient = this.clients.find((client) => client.id === appointment.client_id) || null;
      this.selectedAppointment = appointment;
  }

  openModal(): void {
    if (this.appointmentModal) {
      const modalRef = this.modalService.open(this.appointmentModal, { ariaLabelledBy: 'modal-basic-title' });
      
      modalRef.result.finally(() => {
        this.appointmentModalService.closeModal();
        this.cleandData();
      });
    }
  }

  close(): void {
    this.modalService.dismissAll();
    this.cleandData();
  }

  cleandData(): void {
    this.selectedAppointment = null;
    this.selectedClient = null;
    this.appointmentForm.reset();
    this.searchQuery = '';
    this.filteredClients = [];
    this.errorMessage = '';
    this.serverValidationErrors = {};
    this.isLoading = false;
    this.isSubmitting = false;
  }

  navigateToAddClient(): void {
    this.router.navigate(['/client']);
    this.close();
  }

  private handleError(error: any): void {
    this.errorMessage = error?.message || 'Ocurrió un error inesperado.';
    this.serverValidationErrors = error.validationErrors || {};
    console.error(this.serverValidationErrors);
    this.isLoading = false;
    this.isSubmitting = false;
  }
}