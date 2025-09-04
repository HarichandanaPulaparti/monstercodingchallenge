import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { NavbarComponent } from '../shared/navbar/navbar.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  isLoading = false;
  errorMessage = '';

  constructor(private authService: AuthService) {}

  async signInWithGoogle() {
    this.isLoading = true;
    this.errorMessage = '';
    
    try {
      await this.authService.signInWithGoogle();
      console.log('Login successful');
    } catch (error: any) {
      this.errorMessage = 'Failed to sign in. Please try again.';
      console.error('Login error:', error);
    } finally {
      this.isLoading = false;
    }
  }
}