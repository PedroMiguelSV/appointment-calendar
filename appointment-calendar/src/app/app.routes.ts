import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { CalendarComponent } from './components/calendar/calendar.component';
import { ClientComponent } from './components/client/client.component';
import { ServiceComponent } from './components/service/service.component';
import { LayoutComponent } from './layout/layout.component';
import { authGuard } from './core/guard/auth.guard';
import { RegisterComponent } from './components/register/register.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'calendar', component: CalendarComponent },
      { path: 'client', component: ClientComponent },
      { path: 'service', component: ServiceComponent },
      { path: 'register', component: RegisterComponent }, 
      { path: '', redirectTo: 'calendar', pathMatch: 'full' },
      { path: '**', redirectTo: '/calendar' }
    ],
  },
  { path: '**', redirectTo: '/login' }
];
