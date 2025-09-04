import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  @Input() showLoginButton: boolean = false;
  @Input() showUserInfo: boolean = false;
  
  constructor(
    private router: Router,
    public authService: AuthService
  ) {}

  navigateToHome() {
    this.router.navigate(['/home']);
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  navigateToFlightInfo() {
    // Subscribe to authentication state
    this.authService.isAuthenticated().pipe(take(1)).subscribe({
      next: (isAuthenticated) => {
        if (isAuthenticated) {
          // User is logged in, redirect to flight form
          this.router.navigate(['/flightform']);
        } else {
          // User is not logged in, redirect to login page
          this.router.navigate(['/login']);
        }
      },
      error: (error) => {
        console.error('Authentication check failed:', error);
        // On error, redirect to login for safety
        this.router.navigate(['/login']);
      }
    });
  }

  async signOut() {
    try {
      await this.authService.signOut();
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  }
}