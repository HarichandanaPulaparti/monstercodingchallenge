import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface ExtractedFlightData {
  airline?: string;
  flightNumber?: string;
  arrivalDate?: string;
  arrivalTime?: string;
  confidence: number;
}

@Injectable({
  providedIn: 'root'
})
export class OCRService {
  private apiUrl = 'https://api.openai.com/v1/chat/completions';

  constructor(private http: HttpClient) {}

  async extractFlightDataFromImage(file: File): Promise<ExtractedFlightData> {
    console.log('🤖 OpenAI Vision (Cheap Mode): Starting analysis for:', file.name);
    
    try {
      // Convert image to base64
      const base64Image = await this.fileToBase64(file);
      console.log('📸 Image converted to base64');

      // Optimized prompt for cost efficiency
      const prompt = `Extract flight info from boarding pass image. Return only JSON:
{
  "airline": "airline name",
  "flightNumber": "flight code", 
  "arrivalDate": "YYYY-MM-DD",
  "arrivalTime": "HH:MM AM/PM",
  "confidence": 0.9
}`;

      // Cost-optimized request body
      const requestBody = {
        model: "gpt-4o-mini", // Cheapest vision model - 85% cost reduction!
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                  detail: "low" // 85% cost reduction vs "high"
                }
              }
            ]
          }
        ],
        max_tokens: 100, // Minimal tokens needed
        temperature: 0 // No randomness needed
      };

      // Set headers
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${environment.openaiApiKey}`,
        'Content-Type': 'application/json'
      });

      console.log('🚀 Sending request to OpenAI (Cost-Optimized)...');

      // Make API call
      const response = await this.http.post(this.apiUrl, requestBody, { headers }).toPromise() as any;
      
      console.log('✅ OpenAI Response received:', response);

      // Extract content
      const content = response.choices[0].message.content;
      console.log('📄 Raw content:', content);

      // Clean and parse JSON
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      const extractedData = JSON.parse(cleanContent);

      console.log('🎯 Final extracted data:', extractedData);
      return extractedData;

    } catch (error: any) {
      console.error('❌ OpenAI API Error:', error);
      
      // Enhanced error handling
      if (error.status === 401) {
        throw new Error('Invalid API key. Please check your OpenAI API key.');
      } else if (error.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a few minutes and try again.');
      } else if (error.status === 400) {
        throw new Error('Image format not supported. Please try a different image.');
      } else if (error.message && error.message.includes('quota')) {
        throw new Error('OpenAI credits exhausted. Please add billing to continue or try again later.');
      } else {
        throw new Error('AI analysis failed. Please try again or fill the form manually.');
      }
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      // Compress image before processing to save costs
      if (file.size > 5 * 1024 * 1024) { // If larger than 5MB
        this.compressImage(file).then(resolve).catch(reject);
      } else {
        // Standard conversion for smaller files
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = error => reject(error);
      }
    });
  }

  // Add image compression to reduce costs
  private compressImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Reduce image size to save costs
        const maxWidth = 1024;
        const maxHeight = 1024;
        
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        ctx?.drawImage(img, 0, 0, width, height);
        
        const base64 = canvas.toDataURL('image/jpeg', 0.7).split(',')[1]; 
        resolve(base64);
      };

      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.src = URL.createObjectURL(file);
    });
  }
}