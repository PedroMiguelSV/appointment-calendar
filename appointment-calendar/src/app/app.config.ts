import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptor/auth.interceptor';
import { TokenService } from './core/token/token.service';

export function initializeApp(tokenService: TokenService): () => void {
  return () => tokenService.validateTokenAndScheduleRefresh();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor])
    ), {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [TokenService],
      multi: true
    }
  ]
};
