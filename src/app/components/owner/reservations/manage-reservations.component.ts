import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth.service';
import { VenueService } from '../../../services/venue.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-manage-reservations',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './manage-reservations.component.html',
  styleUrls: ['./manage-reservations.component.scss'],
})
export class ManageReservationsComponent implements OnInit {
  reservations: any[] = [];
  loading = false;
  error = '';
  ownerVenueIds: string[] = [];

  constructor(
    private authService: AuthService,
    private venueService: VenueService,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.fetchOwnerVenuesAndReservations();
  }

  fetchOwnerVenuesAndReservations() {
    this.loading = true;
    this.error = '';
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.error = 'You must be logged in.';
      this.loading = false;
      return;
    }
    this.venueService.getVenuesByOwner(currentUser.id).subscribe({
      next: (venues) => {
        this.ownerVenueIds = venues.map((v: any) => v.id);
        this.fetchReservations();
      },
      error: () => {
        this.error = 'Failed to load venues.';
        this.loading = false;
      },
    });
  }

  fetchReservations() {
    this.http.get<any[]>('http://localhost:3000/events').subscribe({
      next: (events) => {
        // Get all event IDs for this owner's venues
        const ownerEventIds = events
          .filter((e) => this.ownerVenueIds.includes(e.venueId))
          .map((e) => e.id);

        this.http.get<any[]>('http://localhost:3000/reservations').subscribe({
          next: (reservations) => {
            // Filter reservations for owner's events
            this.reservations = reservations.filter((r) =>
              ownerEventIds.includes(r.eventId)
            );
            this.loading = false;
          },
          error: () => {
            this.error = 'Failed to load reservations.';
            this.loading = false;
          },
        });
      },
      error: () => {
        this.error = 'Failed to load events.';
        this.loading = false;
      },
    });
  }

  updateReservationStatus(reservation: any, status: string) {
    this.http
      .patch(`http://localhost:3000/reservations/${reservation.id}`, { status })
      .subscribe({
        next: () => {
          reservation.status = status;
          this.snackBar.open(`Reservation ${status}!`, 'Close', {
            duration: 2000,
            panelClass: 'snackbar-success',
          });
        },
        error: () => {
          this.snackBar.open('Failed to update reservation.', 'Close', {
            duration: 3000,
            panelClass: 'snackbar-error',
          });
        },
      });
  }
}
