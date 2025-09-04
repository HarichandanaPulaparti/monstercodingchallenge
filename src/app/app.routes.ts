import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { LoginGuard } from './guards/login.guard';

export const routes: Routes = [
  { 
    path: 'home', 
    loadComponent: () => import('./components/home.component/home.component').then(m => m.HomeComponent) 
  },
  { 
    path: 'login', 
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent),
    canActivate: [LoginGuard]
  },
  { 
    path: 'flightform', 
    loadComponent: () => import('./components/flight-form/flight-form').then(m => m.FlightFormComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: '', 
    redirectTo: '/home', 
    pathMatch: 'full' 
  },
  {
    path: '**',
    redirectTo: '/home'
  }
];