// src/app/services/flight-storage.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface StoredFlight {
  id: string;
  airline: string;
  flightNumber: string;
  arrivalDate: string;
  arrivalTime: string;
  numOfGuests: number;
  comments?: string;
  submittedAt: Date;
  userEmail: string;
}

@Injectable({
  providedIn: 'root'
})
export class FlightStorageService {
  private flightsSubject = new BehaviorSubject<StoredFlight[]>([]);
  public flights$ = this.flightsSubject.asObservable();

  constructor() {
    this.loadFlights();
  }

  addFlight(flightData: any, userEmail: string): void {
    const newFlight: StoredFlight = {
      id: Date.now().toString(),
      ...flightData,
      submittedAt: new Date(),
      userEmail: userEmail
    };

    const flights = this.getFlights();
    flights.push(newFlight);
    localStorage.setItem('userFlights', JSON.stringify(flights));
    this.flightsSubject.next(flights);
  }

  getUserFlights(userEmail: string): StoredFlight[] {
    return this.getFlights().filter(flight => flight.userEmail === userEmail);
  }

  private getFlights(): StoredFlight[] {
    const stored = localStorage.getItem('userFlights');
    return stored ? JSON.parse(stored) : [];
  }

  private loadFlights(): void {
    this.flightsSubject.next(this.getFlights());
  }
}