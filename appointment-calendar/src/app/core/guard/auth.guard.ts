import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../token/token.service';


export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const tokenService = inject(TokenService);
  const token = tokenService.getToken(); 

  if (token && !tokenService.isTokenExpired(token)) {  
    return true;  
  } else {
    tokenService.clearSession(); 
    router.navigate(['/login']);  
    return false;
  }
};
