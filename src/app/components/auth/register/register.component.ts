import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  registerForm: FormGroup;
  showPassword = false;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role: ['', Validators.required],
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.errorMessage = ''; // Clear any previous errors
      const { email, password, username, role } = this.registerForm.value;
      console.log('Registration role:', role); // Log the role value
      this.authService
        .register(email, password, username, role)
        .then((user) => {
          console.log('Registration successful:', user);
          // Refresh current user to get correct role from backend
          this.authService.refreshCurrentUser();
          setTimeout(() => {
            if (role === 'owner') {
              this.router.navigate(['/owner/dashboard']);
            } else if (role === 'admin') {
              this.router.navigate(['/admin/dashboard']);
            } else {
              this.router.navigate(['/client/dashboard']);
            }
          }, 300); // Short delay to allow refresh
        })
        .catch((error) => {
          console.error('Registration failed:', error);
          this.errorMessage =
            error.message || 'Registration failed. Please try again.';
        });
    }
  }
}
