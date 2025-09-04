import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

interface FlightInfoPayload {
  airline: string;
  arrivalDate: string;
  arrivalTime: string;
  flightNumber: string;
  numOfGuests: number;
  comments?: string;
}

@Component({
  selector: 'app-flight-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, HttpClientModule],
  templateUrl: './flight-form.html',
  styleUrl: './flight-form.css'
})
export class FlightFormComponent {
  flightForm: FormGroup;
  isSubmitting = false;
  responseMessage = '';
  isSuccess = false;

  private apiUrl = 'https://us-central1-crm-sdk.cloudfunctions.net/flightInfoChallenge';
  
  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.flightForm = this.fb.group({
      airline: ['', Validators.required],
      arrivalDate: ['', Validators.required],
      arrivalTime: ['', Validators.required],
      flightNumber: ['', Validators.required],
      numOfGuests: [1, [Validators.required, Validators.min(1)]],
      comments: ['']
    });
  }

  onSubmit() {
    if (this.flightForm.valid) {
      this.isSubmitting = true;
      this.responseMessage = '';
    console.log(this.flightForm)

      const payload: FlightInfoPayload = this.flightForm.value;
      console.log('Payload:', payload);

      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'token': 'WW91IG11c3QgYmUgdGhlIGN1cmlvdXMgdHlwZS4gIEJyaW5nIHRoaXMgdXAgYXQgdGhlIGludGVydmlldyBmb3IgYm9udXMgcG9pbnRzICEh',
        'candidate': 'Hari' 
      });

      this.http.post(this.apiUrl, payload, { headers }).subscribe({
        next: (response) => {
          this.isSuccess = true;
          this.responseMessage = 'Flight information submitted successfully!';
          this.flightForm.reset();
          this.isSubmitting = false;
          console.log('Success:', response);
        },
        error: (error) => {
          this.isSuccess = false;
          this.responseMessage = 'Failed to submit flight information. Please try again.';
          this.isSubmitting = false;
          console.error('Error:', error);
        }
      });
    } else {
      this.responseMessage = 'Please fill in all required fields.';
      this.isSuccess = false;
    }
  }
}