import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import feather from 'feather-icons';
import { AuthService } from '../../../services/auth.service';
import { ReservationService } from '../../../services/reservation.service';
import { EventService } from '../../../services/event.service';
import { Event } from '../../../models/event.model';

interface Reservation {
  id: string;
  userId: string;
  eventId: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  paymentMethod?: string;
  event?: Event;
  numberOfTickets: number;
  paymentStatus: string;
}

interface Payment {
  id: string;
  amount: number;
  date: string;
  status: string;
  eventTitle: string;
  paymentMethod: string;
  reservation?: {
    event?: {
      title?: string;
    };
  };
}

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  reservations: Reservation[] = [];
  payments: Payment[] = [];
  loading = false;
  error = '';

  // Pagination state
  reservationPage = 1;
  reservationPageSize = 4;
  paymentPage = 1;
  paymentPageSize = 4;

  // Modal state
  selectedReservation: Reservation | null = null;
  selectedPayment: Payment | null = null;

  constructor(
    public authService: AuthService,
    private reservationService: ReservationService,
    private eventService: EventService
  ) {}

  ngOnInit() {
    this.loadUserData();
  }

  ngAfterViewInit() {
    feather.replace();
  }

  loadUserData() {
    this.loading = true;
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.error = 'You must be logged in.';
      this.loading = false;
      return;
    }

    this.reservationService.getAllReservations().subscribe({
      next: (reservations: Reservation[]) => {
        // Filter reservations for current user
        this.reservations = reservations.filter(
          (r) => r.userId === currentUser.id
        );

        // Sort reservations by date (newest first)
        this.reservations.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        // Get event details for each reservation
        this.reservations.forEach((reservation) => {
          this.eventService.getEventById(reservation.eventId).subscribe({
            next: (event: Event) => {
              reservation.event = event;
            },
            error: () => {
              reservation.event = {
                id: 0,
                venueId: 0,
                title: 'Event not found',
                description: '',
                date: new Date(),
                startTime: '',
                endTime: '',
                price: 0,
                capacity: 0,
                availableSpots: 0,
                categoryId: '',
                category: '',
                isVerified: false,
                createdAt: new Date(),
                updatedAt: new Date(),
              };
            },
          });
        });

        // Extract payments from reservations
        this.payments = this.reservations.map((r) => ({
          id: r.id,
          amount: r.totalPrice,
          date: r.createdAt,
          status: r.status,
          eventTitle: r.event?.title || 'Unknown Event',
          paymentMethod: r.paymentMethod || 'Credit Card',
        }));

        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load reservations.';
        this.loading = false;
      },
    });
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
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

  getStatusIcon(status: string): string {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'check-circle';
      case 'pending':
        return 'clock';
      case 'cancelled':
        return 'x-circle';
      default:
        return 'help-circle';
    }
  }

  get paginatedReservations(): Reservation[] {
    const start = (this.reservationPage - 1) * this.reservationPageSize;
    return this.reservations.slice(start, start + this.reservationPageSize);
  }

  get reservationTotalPages(): number {
    return Math.ceil(this.reservations.length / this.reservationPageSize) || 1;
  }

  setReservationPage(page: number) {
    if (page >= 1 && page <= this.reservationTotalPages) {
      this.reservationPage = page;
    }
  }

  get paginatedPayments(): Payment[] {
    const start = (this.paymentPage - 1) * this.paymentPageSize;
    return this.payments.slice(start, start + this.paymentPageSize);
  }

  get paymentTotalPages(): number {
    return Math.ceil(this.payments.length / this.paymentPageSize) || 1;
  }

  setPaymentPage(page: number) {
    if (page >= 1 && page <= this.paymentTotalPages) {
      this.paymentPage = page;
    }
  }

  openReservationDetails(reservation: Reservation) {
    this.selectedReservation = reservation;
  }

  closeReservationDetails(event: MouseEvent) {
    event.stopPropagation();
    this.selectedReservation = null;
  }

  openPaymentDetails(payment: Payment) {
    this.selectedPayment = payment;
  }

  closePaymentDetails(event: MouseEvent) {
    event.stopPropagation();
    this.selectedPayment = null;
  }
}
