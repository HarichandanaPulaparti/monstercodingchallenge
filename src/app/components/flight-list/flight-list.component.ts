import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { FlightStorageService, StoredFlight } from '../../services/flight-storage.service';
import { Router } from '@angular/router';
import { NavbarComponent } from '../shared/navbar/navbar.component';

@Component({
  selector: 'app-flight-list',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './flight-list.component.html',
  styleUrls: ['./flight-list.component.css']
})
export class FlightListComponent implements OnInit {
  userFlights: StoredFlight[] = [];

  constructor(
    private authService: AuthService,
    private flightStorage: FlightStorageService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      if (user?.email) {
        this.userFlights = this.flightStorage.getUserFlights(user.email);
      }
    });
  }

  addNewFlight() {
    this.router.navigate(['/flightform']);
  }

  getTotalGuests(): number {
    return this.userFlights.reduce((total, flight) => total + flight.numOfGuests, 0);
  }

  getUniqueAirlines(): number {
    const airlines = new Set(this.userFlights.map(f => f.airline));
    return airlines.size;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  formatDateTime(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}