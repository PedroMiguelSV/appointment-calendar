import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AppointmentModel } from '../../models/appointment.model'; 

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  private apiUrl = 'http://localhost:8000/api/appointments'; 

  constructor(private http: HttpClient) {}

  getAppointments(): Observable<AppointmentModel[]> {
    return this.http.get<AppointmentModel[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  createAppointment(appointment: AppointmentModel): Observable<AppointmentModel> {
    return this.http.post<AppointmentModel>(this.apiUrl, appointment)
      .pipe(catchError(this.handleError));
  }

  updateAppointment(id: number, appointment: AppointmentModel): Observable<AppointmentModel> {
    return this.http.put<AppointmentModel>(`${this.apiUrl}/${id}`, appointment)
      .pipe(catchError(this.handleError));
  }

  deleteAppointment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  getAppointmentById(id: number): Observable<AppointmentModel> {
    return this.http.get<AppointmentModel>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  getAppointmentsFromView(): Observable<AppointmentModel[]> {
    return this.http.get<AppointmentModel[]>(`${this.apiUrl}/view`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {

    let errorResponse = {
      status: error.status,
      message: 'Ocurrió un error inesperado. Por favor, inténtelo de nuevo.',
      validationErrors: null as any
    };

    if (error.status === 422) {
      errorResponse.message = 'Existen errores de validación';
      errorResponse.validationErrors = error.error || {};
    } else if (error.status === 404) {
      errorResponse.message = error.error.error;
     } else if (error.status === 500) {
      errorResponse.message = error.error.error;
    } else {
      return throwError(() => new Error('Ocurrió un error inesperado. Por favor, inténtelo de nuevo.'));
    }
    
    return throwError(() => errorResponse);
  }
}
