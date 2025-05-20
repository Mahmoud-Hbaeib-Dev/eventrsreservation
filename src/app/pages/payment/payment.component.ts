import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReservationService } from '../../services/reservation.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
})
export class PaymentComponent implements OnInit {
  reservationId: string = '';
  tickets: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reservationService: ReservationService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.reservationId = params['reservationId'];
      this.tickets = params['tickets'];
    });
  }

  processPayment() {
    // Here you would integrate with your payment provider
    // For now, we'll simulate a successful payment
    this.reservationService
      .updatePaymentStatus(this.reservationId, 'paid')
      .subscribe({
        next: () => {
          this.notificationService.success(
            'Payment successful! Your reservation is now confirmed.'
          );
          this.router.navigate(['/my-reservations']);
        },
        error: (error) => {
          this.notificationService.error('Payment failed. Please try again.');
          console.error('Payment error:', error);
        },
      });
  }
}
