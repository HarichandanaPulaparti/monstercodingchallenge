import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NavbarComponent } from '../shared/navbar/navbar.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  
  constructor(private router: Router) {}

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  // Feature highlights
  features = [
    {
      icon: '🔐',
      title: 'Secure Authentication',
      description: 'Google Firebase integration with enterprise-grade security'
    },
    {
      icon: '✅',
      title: 'Smart Validation',
      description: 'Real-time form validation with custom business rules'
    }
    // {
    //   icon: '🎨',
    //   title: 'Modern UI/UX',
    //   description: 'Responsive design with stunning animations and effects'
    // }
  ];

  // Animation trigger for stats
  stats = [
    { number: '50,000+', label: 'Flights Processed' },
    { number: '99.9%', label: 'Success Rate' },
    { number: '24/7', label: 'Support Available' }
  ];
}