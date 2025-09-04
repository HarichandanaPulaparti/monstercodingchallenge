import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth.service';
import { FlightFormComponent } from './flight-form/flight-form';
import { LoginComponent } from './login/login.component';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FlightFormComponent, LoginComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('flightchallenge');

  constructor(public authService: AuthService) {}

  async signOut() {
    await this.authService.signOut();
  }
}
