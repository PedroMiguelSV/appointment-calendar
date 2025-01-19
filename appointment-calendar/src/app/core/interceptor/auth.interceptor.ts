import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { TokenService } from '../token/token.service';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<any> => {
  const tokenService = inject(TokenService);
  const token = tokenService.getToken();
  const router = inject(Router);

  if (req.url.includes('/login')) {
    return next(req); 
  }

  if (token && !tokenService.isTokenExpired(token)) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(clonedReq);
  } else {
    router.navigate(['/login']);  
    tokenService.clearSession(); 
    console.error('Solicitud bloqueada. Token inválido o expirado.');

    return throwError(() => new Error('Token inválido o expirado'));
  }
};
