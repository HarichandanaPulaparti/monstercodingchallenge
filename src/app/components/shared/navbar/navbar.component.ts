import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

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

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  async signOut() {
    await this.authService.signOut();
  }
}