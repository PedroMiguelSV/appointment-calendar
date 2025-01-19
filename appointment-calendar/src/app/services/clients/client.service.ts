import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { ClientModel } from '../../models/client.model';

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  private apiUrl = 'http://localhost:8000/api/clients'; 

  constructor(private http: HttpClient) {}

  getClients(): Observable<ClientModel[]> {
    return this.http.get<ClientModel[]>(this.apiUrl).pipe(
      catchError(this.handleError) 
    );
  }

  createClient(client: ClientModel): Observable<ClientModel> {
    return this.http.post<ClientModel>(this.apiUrl, client).pipe(
      catchError(this.handleError) 
    );
  }

  getClientById(id: number): Observable<ClientModel> {
    return this.http.get<ClientModel>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError) 
    );
  }  

  updateClient(id: number, client: ClientModel): Observable<ClientModel> {
    return this.http.put<ClientModel>(`${this.apiUrl}/${id}`, client).pipe(
      catchError(this.handleError) 
    );
  }

  deleteClient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError) 
    );
  }

  searchClients(query: string): Observable<ClientModel[]> {
    let params = new HttpParams();
  
    if (!isNaN(Number(query))) {
      params = params.set('phone', query);  
    } else {
      params = params.set('name', query);  
    }
    return this.http.get<ClientModel[]>(`${this.apiUrl}/search`, { params }).pipe(
      catchError(this.handleError) 
    );
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
