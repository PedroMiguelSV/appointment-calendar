import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ServiceModel } from '../../models/service.model';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {

  private apiUrl = 'http://localhost:8000/api/services'; 

  constructor(private http: HttpClient) {}

  getAllServices(): Observable<ServiceModel[]> {
    return this.http.get<ServiceModel[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  createService(service: ServiceModel): Observable<ServiceModel> {
    return this.http.post<ServiceModel>(this.apiUrl, service)
      .pipe(catchError(this.handleError));
  }

  updateService(service: ServiceModel, id: number): Observable<ServiceModel> {
    return this.http.put<ServiceModel>(`${this.apiUrl}/${id}`, service)
      .pipe(catchError(this.handleError));
  }

  deleteService(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  getServiceById(id: number): Observable<ServiceModel> {
    return this.http.get<ServiceModel>(`${this.apiUrl}/${id}`)
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
