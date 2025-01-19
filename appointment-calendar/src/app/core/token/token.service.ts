import { Injectable } from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { take } from 'rxjs/operators';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private refreshSubscription: Subscription | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  setSession(token: string): void {
    sessionStorage.setItem('token', token);
    this.scheduleTokenRefresh();
  }
  
  clearSession(): void {
    sessionStorage.removeItem('token');
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
      this.refreshSubscription = null;
    }
  }

  scheduleTokenRefresh(): void {
    const token = this.getToken();
    if (token) {
      const expirationDate = this.getTokenExpiration(token);
      if (expirationDate) {
        const expiresInMs = expirationDate.getTime() - Date.now();
        const refreshTime = Math.max(0, expiresInMs - 60000);
  
        if (this.refreshSubscription) {
          this.refreshSubscription.unsubscribe();
          this.refreshSubscription = null;
        }
  
        this.refreshSubscription = timer(refreshTime).pipe(take(1)).subscribe(() => {
          this.refreshToken();
        });
      }
    }
  }

  private refreshToken(): void {
    this.authService.refreshToken().subscribe({
      next: (response) => {
        this.setSession(response.token); 
      },
      error: (error) => {
        console.error('Error al refrescar el token:', error);
        this.clearSession(); 
        this.router.navigate(['/login']); 
      },
    });
  }
  
  getToken(): string | null {
    return sessionStorage.getItem('token');
  }
  
  getTokenExpiration(token: string): Date | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp ? new Date(payload.exp * 1000) : null;
    } catch (e) {
      console.error('Error parsing token expiration:', e);
      return null;
    }
  }

  isTokenExpired(token: string): boolean {
    const expirationDate = this.getTokenExpiration(token);
    return expirationDate ? expirationDate <= new Date() : true;
  }

  validateTokenAndScheduleRefresh(): void {
    const token = this.getToken();
    if (token && !this.isTokenExpired(token)) {
      this.scheduleTokenRefresh();
    } else {
      this.clearSession();
    }
  }
}
