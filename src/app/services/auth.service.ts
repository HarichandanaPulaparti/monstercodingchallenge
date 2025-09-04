import { Injectable, inject } from '@angular/core';
import { Auth, signInWithPopup, GoogleAuthProvider, signOut, user, User } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$: Observable<User | null>;
  private router = inject(Router);

  constructor(private auth: Auth) {
    this.user$ = user(this.auth);
  }

  async signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(this.auth, provider);
      this.router.navigate(['/flightform']);
      return result.user;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  }

  async signOut() {
    try {
      await signOut(this.auth);
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  isAuthenticated(): Observable<boolean> {
    return this.user$.pipe(map(user => !!user));
  }

  getCurrentUser(): Observable<User | null> {
    return this.user$;
  }
}