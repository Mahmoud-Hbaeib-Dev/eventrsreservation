import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loginForm: FormGroup;
  showPassword = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.valid) {
      try {
        const { email, password } = this.loginForm.value;
        const user = await this.authService.login(email, password);
        if (user) {
          // Navigate based on user role
          if (user.role === 'owner') {
            this.router.navigate(['/owner/dashboard']);
          } else if (user.role === 'admin') {
            this.router.navigate(['/admin/dashboard']);
          } else {
            this.router.navigate(['/client/dashboard']);
          }
        }
      } catch (error: any) {
        this.errorMessage = this.getErrorMessage(error.code);
      }
    }
  }

  async loginWithGoogle(): Promise<void> {
    try {
      const user = await this.authService.loginWithGoogle();
      if (user) {
        const role = this.getUserRole(user);
        this.router.navigate([`/${role}`]);
      }
    } catch (error: any) {
      this.errorMessage = this.getErrorMessage(error.code);
    }
  }

  async loginWithFacebook(): Promise<void> {
    try {
      const user = await this.authService.loginWithFacebook();
      if (user) {
        const role = this.getUserRole(user);
        this.router.navigate([`/${role}`]);
      }
    } catch (error: any) {
      this.errorMessage = this.getErrorMessage(error.code);
    }
  }

  private getUserRole(user: any): string {
    // You might want to implement a more sophisticated role detection
    // For now, we'll use a simple email-based approach
    const email = user.email.toLowerCase();
    if (email.includes('admin')) return 'admin';
    if (email.includes('owner')) return 'owner';
    return 'client';
  }

  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Invalid email or password';
      case 'auth/invalid-email':
        return 'Invalid email format';
      case 'auth/user-disabled':
        return 'This account has been disabled';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later';
      default:
        return 'An error occurred during login';
    }
  }
}
