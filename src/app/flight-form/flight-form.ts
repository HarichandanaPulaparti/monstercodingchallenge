import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http'; // Add HttpHeaders import
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
export class FlightFormComponent implements OnInit {
  flightForm: FormGroup;
  isSubmitting = false;
  responseMessage = '';
  isSuccess = false;

  private apiUrl = 'https://us-central1-crm-sdk.cloudfunctions.net/flightInfoChallenge';
  
  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.flightForm = this.createForm();
  }

  ngOnInit() {
    // Form is already created in constructor
  }

  private createForm(): FormGroup {
    return this.fb.group({
      airline: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        this.airlineValidator
      ]],
      arrivalDate: ['', [
        Validators.required,
        this.futureDateValidator
      ]],
      arrivalTime: ['', [
        Validators.required,
        this.timeFormatValidator
      ]],
      flightNumber: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(7),
        this.flightNumberValidator
      ]],
      numOfGuests: ['', [
        Validators.required,
        Validators.min(1),
        this.integerValidator
      ]],
      comments: ['']
    });
  }

  // Custom Validators
  private airlineValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    const airlineRegex = /^[A-Za-z\s\-]+$/;
    if (!airlineRegex.test(control.value)) {
      return { invalidAirline: true };
    }
    return null;
  }

  private futureDateValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    const inputDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to compare dates only
    
    if (isNaN(inputDate.getTime())) {
      return { invalidDate: true };
    }
    
    if (inputDate < today) {
      return { pastDate: true };
    }
    
    return null;
  }

  private timeFormatValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    // Convert 24-hour format to 12-hour format for validation
    const timeValue = control.value;
    
    // If it's in HH:mm format (24-hour), convert to 12-hour
    if (/^\d{2}:\d{2}$/.test(timeValue)) {
      return null; // Browser time input gives us valid time
    }
    
    // Check if it's already in 12-hour format
    const time12Regex = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i;
    if (!time12Regex.test(timeValue)) {
      return { invalidTimeFormat: true };
    }
    
    return null;
  }

  private flightNumberValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    const flightNumberRegex = /^[A-Z]{2,3}\d{1,4}$/;
    if (!flightNumberRegex.test(control.value.toUpperCase())) {
      return { invalidFlightNumber: true };
    }
    return null;
  }

  private integerValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    const value = Number(control.value);
    if (!Number.isInteger(value)) {
      return { notInteger: true };
    }
    return null;
  }

  // Helper methods for template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.flightForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.flightForm.get(fieldName);
    if (!field || !field.errors) return '';

    const errors = field.errors;

    switch (fieldName) {
      case 'airline':
        if (errors['required']) return 'Airline name is required';
        if (errors['minlength']) return 'Airline name must be at least 2 characters';
        if (errors['maxlength']) return 'Airline name must not exceed 50 characters';
        if (errors['invalidAirline']) return 'Airline name can only contain letters, spaces, and hyphens';
        break;

      case 'arrivalDate':
        if (errors['required']) return 'Arrival date is required';
        if (errors['invalidDate']) return 'Please enter a valid date';
        if (errors['pastDate']) return 'Arrival date cannot be in the past';
        break;

      case 'arrivalTime':
        if (errors['required']) return 'Arrival time is required';
        if (errors['invalidTimeFormat']) return 'Please use format: HH:MM AM/PM (e.g., 01:45 PM)';
        break;

      case 'flightNumber':
        if (errors['required']) return 'Flight number is required';
        if (errors['minlength']) return 'Flight number must be at least 3 characters';
        if (errors['maxlength']) return 'Flight number must not exceed 7 characters';
        if (errors['invalidFlightNumber']) return 'Flight number format: 2-3 letters + 1-4 digits (e.g., AA123)';
        break;

      case 'numOfGuests':
        if (errors['required']) return 'Number of guests is required';
        if (errors['min']) return 'Number of guests must be at least 1';
        if (errors['notInteger']) return 'Number of guests must be a whole number';
        break;
    }

    return '';
  }

  private formatTimeFor12Hour(time24: string): string {
    if (!time24) return '';
    
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    
    return `${hour12.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  }

  onSubmit() {
    if (this.flightForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.flightForm.controls).forEach(key => {
        this.flightForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    this.responseMessage = '';

    const formValue = this.flightForm.value;
    
    // Format the data according to API requirements
    const payload: FlightInfoPayload = {
      airline: formValue.airline.trim(),
      arrivalDate: formValue.arrivalDate,
      arrivalTime: this.formatTimeFor12Hour(formValue.arrivalTime),
      flightNumber: formValue.flightNumber.toUpperCase(),
      numOfGuests: parseInt(formValue.numOfGuests, 10),
      comments: formValue.comments?.trim() || undefined
    };

    // Add the required headers
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'token': 'WW91IG11c3QgYmUgdGhlIGN1cmlvdXMgdHlwZS4gIEJyaW5nIHRoaXMgdXAgYXQgdGhlIGludGVydmlldyBmb3IgYm9udXMgcG9pbnRzICEh',
      'candidate': 'Hari' 
    });

    console.log('Submitting payload:', payload);

    this.http.post(this.apiUrl, payload, { headers }).subscribe({
      next: (response: any) => {
        console.log('Success response:', response);
        this.isSuccess = true;
        this.responseMessage = 'Flight information submitted successfully!';
        this.flightForm.reset();
      },
      error: (error) => {
        console.error('Error response:', error);
        this.isSuccess = false;
        this.responseMessage = error.error?.message || 'Failed to submit flight information. Please try again.';
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }
}