import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { 
    path: 'login', 
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) 
  },
  { 
    path: 'flightform', 
    loadComponent: () => import('./components/flight-form/flight-form').then(m => m.FlightFormComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: '', 
    redirectTo: '/login', 
    pathMatch: 'full' 
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];