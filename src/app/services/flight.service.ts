import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface FlightInfoPayload {
  airline: string;
  arrivalDate: string;
  arrivalTime: string;
  flightNumber: string;
  numOfGuests: number;
  comments?: string;
}

export interface FlightApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class FlightService {
  private readonly apiUrl = environment.api.flightInfoUrl;
  private readonly apiToken = environment.api.token;
  private readonly candidate = environment.api.candidate;
  
  constructor(private http: HttpClient) {}
  submitFlightInfo(flightData: FlightInfoPayload): Observable<FlightApiResponse> {
    const headers = this.getApiHeaders();
    
    console.log('FlightService: Submitting flight data to:', this.apiUrl);
    console.log('FlightService: Using candidate:', this.candidate);
    console.log('FlightService: Payload:', flightData);
    
    return this.http.post<FlightApiResponse>(this.apiUrl, flightData, { headers });
  }

  private getApiHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'token': this.apiToken,
      'candidate': this.candidate
    });
  }

  formatTimeFor12Hour(time24: string): string {
    if (!time24) return '';
    
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    
    return `${hour12.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  }

 
  prepareFlightPayload(formData: any): FlightInfoPayload {
    return {
      airline: formData.airline?.trim() || '',
      arrivalDate: formData.arrivalDate || '',
      arrivalTime: this.formatTimeFor12Hour(formData.arrivalTime || ''),
      flightNumber: formData.flightNumber?.toUpperCase() || '',
      numOfGuests: parseInt(formData.numOfGuests, 10) || 1,
      comments: formData.comments?.trim() || undefined
    };
  }
}