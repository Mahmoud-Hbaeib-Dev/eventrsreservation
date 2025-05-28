import { Injectable } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  FacebookAuthProvider,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  ActionCodeSettings,
} from '@angular/fire/auth';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { User as AppUser } from '../models/user.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<AppUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private apiUrl = 'http://localhost:3000';

  actionCodeSettings: ActionCodeSettings = {
    url: 'http://localhost:4200/login', // Change to your app's login route
    handleCodeInApp: true,
  };

  constructor(private auth: Auth, private http: HttpClient) {
    this.auth.onAuthStateChanged(async (user) => {
      if (user) {
        // When auth state changes, fetch the user's role from db.json
        try {
          const users = await this.http
            .get<AppUser[]>(`${this.apiUrl}/users?email=${user.email}`)
            .toPromise();
          const dbUser = users?.[0];

          if (dbUser) {
            const firebaseUser = this.mapFirebaseUser(user);
            if (firebaseUser) {
              const userWithRole: AppUser = {
                ...firebaseUser,
                role: dbUser.role,
              };
              this.currentUserSubject.next(userWithRole);
            }
          } else {
            this.currentUserSubject.next(this.mapFirebaseUser(user));
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
          this.currentUserSubject.next(this.mapFirebaseUser(user));
        }
      } else {
        this.currentUserSubject.next(null);
      }
    });
  }

  async login(email: string, password: string): Promise<AppUser | null> {
    try {
      const result = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );

      // Fetch user data from db.json
      const users = await this.http
        .get<AppUser[]>(`${this.apiUrl}/users?email=${email}`)
        .toPromise();
      const dbUser = users?.[0];

      if (dbUser) {
        // Update the current user with the role from db.json
        const firebaseUser = this.mapFirebaseUser(result.user);
        if (firebaseUser) {
          const userWithRole: AppUser = {
            ...firebaseUser,
            role: dbUser.role,
          };
          this.currentUserSubject.next(userWithRole);
          return userWithRole;
        }
      }

      return this.mapFirebaseUser(result.user);
    } catch (error) {
      throw error;
    }
  }

  async register(
    email: string,
    password: string,
    username: string,
    role: string
  ): Promise<AppUser | null> {
    try {
      // First create the user in Firebase
      const result = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );

      // Then create the user in db.json
      const newUser: AppUser = {
        id: result.user.uid,
        email: email,
        username: username,
        password: password, // Note: In a production app, you should never store plain passwords
        role: role as 'admin' | 'owner' | 'client',
        firstName: '',
        lastName: '',
        phone: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      console.log('New user to save:', newUser); // Log the newUser object
      try {
        // Save to db.json
        await this.http.post(`${this.apiUrl}/users`, newUser).toPromise();
      } catch (dbError) {
        // If db.json save fails, delete the Firebase user
        await result.user.delete();
        throw new Error('Failed to save user data. Please try again.');
      }

      return this.mapFirebaseUser(result.user);
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        throw new Error(
          'This email is already registered. Please use a different email or login.'
        );
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Please enter a valid email address.');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password should be at least 6 characters long.');
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error(
          'Network error. Please check your internet connection.'
        );
      } else {
        throw new Error('Registration failed. Please try again.');
      }
    }
  }

  async loginWithGoogle(): Promise<AppUser | null> {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      return this.mapFirebaseUser(result.user);
    } catch (error) {
      throw error;
    }
  }

  async loginWithFacebook(): Promise<AppUser | null> {
    try {
      const provider = new FacebookAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      return this.mapFirebaseUser(result.user);
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    await signOut(this.auth);
  }

  getCurrentUser(): AppUser | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    // You might want to store and check the role from Firestore
    return user?.role === role;
  }

  sendSignInLink(email: string) {
    return sendSignInLinkToEmail(this.auth, email, this.actionCodeSettings);
  }

  isSignInWithEmailLink(url: string) {
    return isSignInWithEmailLink(this.auth, url);
  }

  signInWithEmailLink(email: string, url: string) {
    return signInWithEmailLink(this.auth, email, url);
  }

  private mapFirebaseUser(user: User | null): AppUser | null {
    if (!user) return null;
    return {
      id: user.uid,
      email: user.email || '',
      username: user.displayName || '',
      password: '', // No password from Firebase
      firstName: '',
      lastName: '',
      role: 'client', // This will be overridden by the role from db.json
      phone: user.phoneNumber || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  public setCurrentUser(user: AppUser) {
    this.currentUserSubject.next(user);
  }

  refreshCurrentUser() {
    const user = this.getCurrentUser();
    if (user && user.email) {
      this.http
        .get<AppUser[]>(`${this.apiUrl}/users?email=${user.email}`)
        .subscribe((users) => {
          const dbUser = users?.[0];
          if (dbUser) {
            this.currentUserSubject.next({ ...user, ...dbUser });
          }
        });
    }
  }
}
