import { Component, OnInit } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { AppointmentService } from '../../services/appointments/appointment.service';
import { AppointmentModel } from '../../models/appointment.model';
import esLocale from '@fullcalendar/core/locales/es';
import { AppointmentModalService } from '../../services/apointmentModal/appointment-modal.service';
import { AppointmentModalComponent } from '../appointment-modal-component/appointment-modal-component.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [ FullCalendarModule, AppointmentModalComponent, CommonModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
})

export class CalendarComponent implements OnInit {
  loadingAppointments: boolean = false;
  errorMessage: string = '';
  serverValidationErrors: any = {};

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
    slotDuration: '00:30:00', 
    slotLabelInterval: '00:30:00',
    locale: esLocale,
    editable: true,
    selectable: true,
    height: 625,
    select: this.handleSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    headerToolbar: {
      left: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth',
      center: 'title',
      right: 'prevYear,prev next,nextYear today',
    },
    timeZone: 'local',
    eventBackgroundColor: '#0d6efd',
    eventBorderColor: '#0a58ca',
    eventTextColor: '#ffffff',
    eventDisplay: 'block',
    eventTimeFormat: { hour: 'numeric', minute: '2-digit', meridiem: 'short' },
    slotLabelFormat: { hour: 'numeric', minute: '2-digit', meridiem: 'short' },
    dayMaxEventRows: true,
    allDaySlot: false,
    eventContent: (arg) => {
      const timeText = arg.timeText ? `<b>${arg.timeText}</b>` : '';
      const titleText = arg.event.title;
      return { html: `${timeText} ${titleText}` };
    },
  };

  constructor(
    private appointmentService: AppointmentService,
    private appointmentModalService: AppointmentModalService,
  ) {}

  ngOnInit(): void {
    this.loadAppointments();

  this.appointmentModalService.reloadAppointments$.subscribe(() => {
    this.loadAppointments();
  });
  }

  loadAppointments() {
    this.loadingAppointments = true;
    this.appointmentService.getAppointmentsFromView().subscribe({
      next: (appointments: AppointmentModel[]) => {
        this.calendarOptions.events = appointments.map(appointment => ({
          id: appointment.appointment_id.toString(),
          title: `${appointment.services}`,
          start: `${appointment.date}T${appointment.startTime}`,
          end: `${appointment.date}T${appointment.endTime}`,
          extendedProps: {
            clientId: appointment.client_id,
            clientName: appointment.client_name,
            phoneClient: appointment.client_phone,
            services: appointment.service_ids.split(',').map(Number),
            service_ids: appointment.service_ids,
            note: appointment.note,
          }
        }));
        this.loadingAppointments = false;
      },
      error: (error) => this.handleError(error)
    });
  }

  handleSelect(selectInfo: { start: Date }): void {
    const date = selectInfo.start.toLocaleDateString('en-CA');
    const startTime = selectInfo.start.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });

    this.appointmentModalService.selectAppointment({
      date,
      startTime,
      isNew: true,
    });

    this.appointmentModalService.openModal();
  }
  
  handleEventClick(eventInfo: EventClickArg): void {
    const appointmentDetails = {
      appointment_id: Number(eventInfo.event.id),
      client_id: eventInfo.event.extendedProps['clientId'],
      client_name: eventInfo.event.extendedProps['clientName'],
      client_phone: eventInfo.event.extendedProps['phoneClient'],
      services: eventInfo.event.extendedProps['services'],
      date: eventInfo.event.start? eventInfo.event.start.toISOString().split('T')[0]: '',
      startTime: eventInfo.event.start? eventInfo.event.start.toTimeString().split(' ')[0].substring(0, 5): '',
      endTime: eventInfo.event.extendedProps['endTime'],
      note: eventInfo.event.extendedProps['note'],
    };
    
    this.appointmentModalService.selectAppointment(appointmentDetails);
    this.appointmentModalService.openModal();
  }

  private handleError(error: any): void {
    this.errorMessage = error?.message || 'Ocurrió un error inesperado.';
    this.serverValidationErrors = error.validationErrors || {};
    this.loadingAppointments = false;
  }
}