import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UserModel } from '../../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}
  
  login(credentials: UserModel): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  register(user: UserModel): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  getUsers(): Observable<UserModel[]> {
    return this.http.get<UserModel[]>(`${this.apiUrl}/users`).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${userId}`).pipe(
      catchError(this.handleError.bind(this))
    );
  }
  
  logout(): Observable<void> {
      return this.http.post<void>(`${this.apiUrl}/logout`, {}).pipe(
        catchError(this.handleError.bind(this))
      );
    }

    refreshToken(): Observable<any> {
      return this.http.post(`${this.apiUrl}/refresh`, {}).pipe(
        catchError(this.handleError.bind(this))
      );
    }

    private handleError(error: HttpErrorResponse): Observable<never> {

      let errorResponse = {
        status: error.status,
        message: 'Ocurrió un error inesperado. Por favor, inténtelo de nuevo.',
        validationErrors: null as any
      };

    if (error.status === 401) {
      errorResponse.message = error.error.error;
    } else if (error.status === 422) {
      errorResponse.message = 'Existen errores de validación';
      errorResponse.validationErrors = error.error || {};
    } else if (error.status === 403) {
      errorResponse.validationErrors = error.error.error || {};
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
