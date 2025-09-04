import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { take, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate() {
    return this.authService.isAuthenticated().pipe(
      take(1),
      map(isAuthenticated => {
        if (isAuthenticated) {
          this.router.navigate(['/flightform']);
          return false;
        } else {
          return true;
        }
      })
    );
  }
}