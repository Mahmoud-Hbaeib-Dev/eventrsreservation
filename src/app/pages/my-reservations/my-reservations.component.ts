import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Reservation } from '../../models/reservation.model';
import { Event } from '../../models/event.model';
import { AuthService } from '../../services/auth.service';
import { ReservationService } from '../../services/reservation.service';
import { EventService } from '../../services/event.service';
import { NotificationService } from '../../services/notification.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-my-reservations',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './my-reservations.component.html',
  styleUrls: ['./my-reservations.component.scss'],
})
export class MyReservationsComponent implements OnInit {
  reservations: Reservation[] = [];
  filteredReservations: Reservation[] = [];
  loading = true;
  error: string | null = null;

  // Filter and sort properties
  searchQuery = '';
  statusFilter = 'all';
  sortBy = 'date';

  // Add these properties:
  showConfirmModal = false;
  reservationToCancel: Reservation | null = null;
  showDetailsModal = false;
  selectedReservation: Reservation | null = null;
  editedTickets: number = 1;
  isConfirmed: boolean = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private reservationService: ReservationService,
    private eventService: EventService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations(): void {
    this.loading = true;
    this.error = null;

    // Check if user is logged in
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.error = 'Please log in to view your reservations';
      this.loading = false;
      console.log('No user is logged in, cannot load reservations');
      return;
    }

    console.log('Loading reservations for user:', currentUser);

    this.reservationService.getUserReservations().subscribe({
      next: (reservations) => {
        console.log('Received reservations:', reservations);

        if (reservations.length === 0) {
          console.log('No reservations found');
          this.reservations = [];
          this.filteredReservations = [];
          this.loading = false;
          return;
        }

        // Create an array of observables for each event to fetch
        const eventObservables = reservations.map((reservation) => {
          console.log(
            `Fetching event ${reservation.eventId} for reservation ${reservation.id}`
          );
          return this.eventService.getEventById(reservation.eventId.toString());
        });

        // Fetch all events in parallel
        forkJoin(eventObservables).subscribe({
          next: (events) => {
            console.log('Received events:', events);

            // Combine reservation data with event data
            this.reservations = reservations.map((reservation, index) => {
              const event = events[index];
              console.log(
                `Mapping reservation ${reservation.id} with event ${
                  event?.title || 'unknown'
                }`
              );
              return {
                ...reservation,
                eventName: event
                  ? event.title
                  : reservation.eventName || 'Unknown Event',
                eventDate: event ? event.date : reservation.eventDate,
              };
            });

            this.filterReservations();
            this.loading = false;
          },
          error: (error) => {
            console.error('Error loading event details:', error);
            // Still show reservations even if event details can't be loaded
            this.reservations = reservations;
            this.filterReservations();
            this.loading = false;
          },
        });
      },
      error: (error) => {
        this.error = 'Failed to load reservations. Please try again later.';
        this.loading = false;
        console.error('Error loading reservations:', error);
      },
    });
  }

  filterReservations(): void {
    let filtered = [...this.reservations];

    // Apply search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (reservation) =>
          reservation.eventName?.toLowerCase().includes(query) ||
          reservation.id.toString().toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(
        (reservation) =>
          reservation.status.toLowerCase() === this.statusFilter.toLowerCase()
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'date':
          return (
            new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
          );
        case 'event':
          return a.eventName.localeCompare(b.eventName);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    this.filteredReservations = filtered;
  }

  viewReservationDetails(reservation: Reservation): void {
    this.selectedReservation = reservation;
    this.editedTickets = reservation.numberOfTickets;
    this.isConfirmed = false;
    this.showDetailsModal = true;
  }

  onTicketsChange(event: any): void {
    const value = +event.target.value;
    this.editedTickets = value > 0 ? value : 1;
    this.isConfirmed = false;
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedReservation = null;
  }

  confirmReservation(reservation: Reservation): void {
    if (reservation) {
      reservation.numberOfTickets = this.editedTickets;
      this.isConfirmed = true;
      this.notificationService.success(
        'Reservation confirmed! You can now proceed to payment.'
      );
    }
  }

  goToPayment(reservation: Reservation): void {
    if (reservation && this.isConfirmed) {
      this.router.navigate(['/payment'], {
        queryParams: {
          reservationId: reservation.id,
          tickets: this.editedTickets,
        },
      });
    }
  }

  cancelReservation(reservation: Reservation): void {
    this.reservationToCancel = reservation;
    this.showConfirmModal = true;
  }

  closeConfirmModal(): void {
    this.showConfirmModal = false;
    this.reservationToCancel = null;
  }

  confirmCancel(): void {
    if (this.reservationToCancel) {
      this.reservationService
        .cancelReservation(this.reservationToCancel.id.toString())
        .subscribe({
          next: () => {
            // Update the local reservations list
            const index = this.reservations.findIndex(
              (r) => r.id === this.reservationToCancel!.id
            );
            if (index !== -1) {
              this.reservations[index] = {
                ...this.reservationToCancel!,
                status: 'cancelled',
              };
              this.filterReservations();
              this.notificationService.success(
                'Reservation cancelled successfully'
              );
            }
            this.closeConfirmModal();
          },
          error: (error) => {
            console.error('Error cancelling reservation:', error);
            this.notificationService.error(
              'Failed to cancel reservation. Please try again later.'
            );
            this.closeConfirmModal();
          },
        });
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'confirmed':
        return 'status-confirmed';
      case 'pending':
        return 'status-pending';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  }

  getPaymentStatusClass(status: string): string {
    switch (status) {
      case 'paid':
        return 'payment-paid';
      case 'pending':
        return 'payment-pending';
      case 'refunded':
        return 'payment-refunded';
      default:
        return '';
    }
  }

  refreshReservations(): void {
    this.notificationService.info('Refreshing your reservations...');
    this.loadReservations();
  }

  changeTickets(amount: number): void {
    this.editedTickets = Math.max(1, this.editedTickets + amount);
    this.isConfirmed = false;
  }
}
