import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FlightService, FlightInfoPayload } from '../../services/flight.service';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { FlightStorageService } from '../../services/flight-storage.service';
import { AuthService } from '../../services/auth.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-flight-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NavbarComponent],
  templateUrl: './flight-form.html',
  styleUrl: './flight-form.css'
})
export class FlightFormComponent implements OnInit {
  flightForm: FormGroup;
  isSubmitting = false;
  responseMessage = '';
  isSuccess = false;
  
  constructor(
    private fb: FormBuilder,
    private flightService: FlightService,
    private flightStorage: FlightStorageService,
    private authService: AuthService,
    private router: Router
  ) {
    this.flightForm = this.createForm();
  }

  ngOnInit() {
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
    today.setHours(0, 0, 0, 0);
    
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
    
    const timeValue = control.value;
    
    if (/^\d{2}:\d{2}$/.test(timeValue)) {
      return null;
    }
    
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

  async onSubmit() {
  if (this.flightForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.flightForm.controls).forEach(key => {
        this.flightForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    this.responseMessage = '';

    try {
      // Prepare payload using FlightService
      const payload = this.flightService.prepareFlightPayload(this.flightForm.value);

      console.log('FlightFormComponent: Prepared payload:', payload);
      

      // Submit using FlightService (convert to promise for async/await)
      const response = await this.flightService.submitFlightInfo(payload).toPromise();
      
      console.log('FlightFormComponent: Success response:', response);
      
      // Store flight data locally for the flight list
      const user = await this.getCurrentUser();
      if (user?.email) {
        this.flightStorage.addFlight(this.flightForm.value, user.email);
        console.log('Flight stored locally for user:', user.email);
      }
      this.isSuccess = true;
      this.responseMessage = 'Flight information submitted successfully! You can view it in ';
      this.flightForm.reset();
      
    } catch (error: any) {
      console.error('FlightFormComponent: Error response:', error);
      this.isSuccess = false;
      this.responseMessage = error.error?.message || 'Failed to submit flight information. Please try again.';
    } finally {
      this.isSubmitting = false;
    }
  }
private async getCurrentUser(): Promise<any> {
  return new Promise((resolve) => {
      this.authService.user$.pipe(take(1)).subscribe(user => {
        resolve(user);
      });
    });
  }
  navigateToMyFlights() {
  this.router.navigate(['/my-flights']);
}
      
}