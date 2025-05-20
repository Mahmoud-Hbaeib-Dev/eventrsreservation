import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="navbar">
      <div class="navbar-brand">
        <a routerLink="/">Event Reservation</a>
      </div>

      <div class="navbar-menu">
        <ng-container
          *ngIf="authService.isAuthenticated(); else notAuthenticated"
        >
          <ng-container *ngIf="authService.hasRole('admin')">
            <a routerLink="/admin">Admin Dashboard</a>
          </ng-container>

          <ng-container *ngIf="authService.hasRole('owner')">
            <a routerLink="/owner">Owner Dashboard</a>
            <a routerLink="/owner/venues">My Venues</a>
          </ng-container>

          <ng-container *ngIf="authService.hasRole('client')">
            <a routerLink="/client/events">Events</a>
            <a routerLink="/client/reservations">My Reservations</a>
          </ng-container>

          <button (click)="logout()">Logout</button>
        </ng-container>

        <ng-template #notAuthenticated>
          <a routerLink="/auth/login">Login</a>
          <a routerLink="/auth/register">Register</a>
        </ng-template>
      </div>
    </nav>
  `,
  styles: [
    `
      .navbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 2rem;
        background-color: #333;
        color: white;
      }

      .navbar-brand a {
        color: white;
        text-decoration: none;
        font-size: 1.5rem;
        font-weight: bold;
      }

      .navbar-menu {
        display: flex;
        gap: 1rem;
        align-items: center;
      }

      .navbar-menu a {
        color: white;
        text-decoration: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        transition: background-color 0.3s;
      }

      .navbar-menu a:hover {
        background-color: #444;
      }

      button {
        background-color: #dc3545;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.3s;
      }

      button:hover {
        background-color: #c82333;
      }
    `,
  ],
})
export class NavbarComponent {
  constructor(public authService: AuthService, private router: Router) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
