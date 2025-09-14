import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FlightService, FlightInfoPayload } from '../../services/flight.service';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { FlightStorageService } from '../../services/flight-storage.service';
import { AuthService } from '../../services/auth.service';
import { OCRService, ExtractedFlightData } from '../../services/ocr.service';
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
  
  // OCR-related properties
  isProcessingOCR = false;
  ocrMessage = '';
  isOCRSuccess = false;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  
  constructor(
    private fb: FormBuilder,
    private flightService: FlightService,
    private flightStorage: FlightStorageService,
    private authService: AuthService,
    private ocrService: OCRService,
    private router: Router
  ) {
    this.flightForm = this.createForm();
  }

  ngOnInit() {
  }


  // OCR Methods
  onFileSelected(event: any): void {
  const file = event.target.files[0];
  if (file) {
    this.selectedFile = file;
    this.createImagePreview(file);
    this.ocrMessage = '';
    this.isOCRSuccess = false;
    console.log('File selected:', file.name);
  }
}
  

  private createImagePreview(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagePreview = e.target.result;
    };
    reader.readAsDataURL(file);
  }


async processOCR(): Promise<void> {
  if (!this.selectedFile) {
    this.ocrMessage = '📁 Please select an image first.';
    this.isOCRSuccess = false;
    return;
  }

  console.log('Starting AI Vision analysis for file:', this.selectedFile.name);
  
  this.isProcessingOCR = true;
  this.ocrMessage = '🤖 AI is analyzing your boarding pass... This may take a few seconds.';
  this.isOCRSuccess = false;

  try {
    const extractedData = await this.ocrService.extractFlightDataFromImage(this.selectedFile);
    
    console.log('AI Vision completed with data:', extractedData);
    
    if (extractedData.confidence && extractedData.confidence > 0.6) {
      this.autofillForm(extractedData);
      this.ocrMessage = `✅ AI successfully extracted flight data! Confidence: ${Math.round(extractedData.confidence * 100)}%`;
      this.isOCRSuccess = true;
    } else if (extractedData.confidence && extractedData.confidence > 0.3) {
      this.autofillForm(extractedData);
      this.ocrMessage = `⚠️ AI extracted some data with low confidence (${Math.round(extractedData.confidence * 100)}%). Please verify all fields.`;
      this.isOCRSuccess = true;
    } else {
      this.ocrMessage = '❌ AI could not reliably extract data from this image. Please try a clearer image or fill manually.';
      this.isOCRSuccess = false;
    }
    
  } catch (error: any) {
    console.error('AI Vision processing failed:', error);
    this.ocrMessage = error.message || '❌ AI analysis failed. Please try again or fill the form manually.';
    this.isOCRSuccess = false;
  } finally {
    this.isProcessingOCR = false;
    console.log('AI Vision process completed');
  }
}


private autofillForm(data: any): void {
  console.log('Auto-filling form with extracted data:', data);
  
  let displayTime = data.arrivalTime;
  if (displayTime && displayTime.includes(':')) {
  }

  this.flightForm.patchValue({
    airline: data.airline || '',
    flightNumber: data.flightNumber || '',
    arrivalDate: data.arrivalDate || '',
    arrivalTime: displayTime || ''
  });

  if (data.airline) this.flightForm.get('airline')?.markAsTouched();
  if (data.flightNumber) this.flightForm.get('flightNumber')?.markAsTouched();
  if (data.arrivalDate) this.flightForm.get('arrivalDate')?.markAsTouched();
  if (data.arrivalTime) this.flightForm.get('arrivalTime')?.markAsTouched();
  
  console.log('Form auto-filled successfully');
}


clearOCR(): void {
  this.selectedFile = null;
  this.imagePreview = null;
  this.ocrMessage = '';
  this.isOCRSuccess = false;
  this.isProcessingOCR = false;
  
  this.flightForm.patchValue({
    airline: '',
    flightNumber: '',
    arrivalDate: '',
    arrivalTime: ''
  });
  
  ['airline', 'flightNumber', 'arrivalDate', 'arrivalTime'].forEach(fieldName => {
    this.flightForm.get(fieldName)?.markAsUntouched();
    this.flightForm.get(fieldName)?.markAsPristine();
  });
  
  const fileInput = document.getElementById('boarding-pass-upload') as HTMLInputElement;
  if (fileInput) {
    fileInput.value = '';
  }
  
  console.log('OCR data and form fields cleared');
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