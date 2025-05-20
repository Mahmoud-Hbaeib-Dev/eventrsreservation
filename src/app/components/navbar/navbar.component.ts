import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  standalone: true,
  imports: [RouterModule, CommonModule],
})
export class NavbarComponent {
  currentUser: User | null = null;

  constructor(private router: Router, public authService: AuthService) {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  getProfileRoute(): string {
    if (!this.currentUser) return '/auth/login';
    if (this.currentUser.role === 'admin') return '/admin';
    if (this.currentUser.role === 'owner') return '/owner/dashboard';
    return '/client/dashboard';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
