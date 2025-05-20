import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ReservationService } from '../../services/reservation.service';
import { NotificationService } from '../../services/notification.service';

interface PaymentDetails {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
}

type PaymentMethod = 'card' | 'door';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
})
export class PaymentComponent implements OnInit {
  reservationId: string = '';
  tickets: number = 0;
  totalAmount: number = 0;
  eventName: string = '';
  eventDate: string = '';
  pricePerTicket: number = 0;
  loading: boolean = false;
  paymentMethod: PaymentMethod = 'card';
  paymentDetails: PaymentDetails = {
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reservationService: ReservationService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      // Check if all required parameters are present
      if (
        !params['reservationId'] ||
        !params['tickets'] ||
        !params['totalAmount']
      ) {
        this.notificationService.error('Invalid payment information');
        this.router.navigate(['/my-reservations']);
        return;
      }

      this.reservationId = params['reservationId'];
      this.tickets = params['tickets'];
      this.totalAmount = params['totalAmount'] || 0;
      this.eventName = params['eventName'] || '';
      this.eventDate = params['eventDate'] || '';
      this.pricePerTicket = params['pricePerTicket'] || 0;

      // Validate the data
      if (this.totalAmount <= 0 || this.tickets <= 0) {
        this.notificationService.error('Invalid payment amount');
        this.router.navigate(['/my-reservations']);
        return;
      }
    });
  }

  selectPaymentMethod(method: PaymentMethod): void {
    this.paymentMethod = method;
  }

  formatCardNumber(event: any) {
    let value = event.target.value.replace(/\s/g, '').replace(/\D/g, '');
    if (value.length > 16) value = value.substr(0, 16);
    // Insert space after every 4 digits
    const matches = value.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      event.target.value = parts.join(' ');
    } else {
      event.target.value = value;
    }
  }

  formatExpiryDate(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.substr(0, 4);
    if (value.length >= 2) {
      value = value.substr(0, 2) + '/' + value.substr(2);
    }
    event.target.value = value;
  }

  validateForm(): boolean {
    if (
      !this.paymentDetails.cardNumber ||
      this.paymentDetails.cardNumber.replace(/\s/g, '').length !== 16
    ) {
      this.notificationService.error('Please enter a valid card number');
      return false;
    }
    if (!this.paymentDetails.cardHolder) {
      this.notificationService.error('Please enter the card holder name');
      return false;
    }
    if (
      !this.paymentDetails.expiryDate ||
      this.paymentDetails.expiryDate.length !== 5
    ) {
      this.notificationService.error(
        'Please enter a valid expiry date (MM/YY)'
      );
      return false;
    }
    if (!this.paymentDetails.cvv || this.paymentDetails.cvv.length !== 3) {
      this.notificationService.error('Please enter a valid CVV');
      return false;
    }
    return true;
  }

  processPayment() {
    if (!this.validateForm()) return;

    this.loading = true;
    // Simulate payment processing
    setTimeout(() => {
      this.reservationService
        .updatePaymentStatus(this.reservationId, 'paid')
        .subscribe({
          next: () => {
            this.notificationService.success(
              'Payment successful! Your reservation is now confirmed.'
            );
            setTimeout(() => {
              this.router.navigate(['/my-reservations']);
            }, 1500);
          },
          error: (error) => {
            this.notificationService.error('Payment failed. Please try again.');
            console.error('Payment error:', error);
          },
          complete: () => {
            this.loading = false;
          },
        });
    }, 1500);
  }

  confirmDoorPayment() {
    this.loading = true;
    // Update reservation status to indicate door payment
    this.reservationService
      .updatePaymentStatus(this.reservationId, 'pending')
      .subscribe({
        next: () => {
          this.notificationService.success(
            'Door payment confirmed! Please remember to bring payment to the event.'
          );
          setTimeout(() => {
            this.router.navigate(['/my-reservations']);
          }, 1500);
        },
        error: (error) => {
          this.notificationService.error(
            'Failed to confirm door payment. Please try again.'
          );
          console.error('Door payment error:', error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  goBack() {
    this.router.navigate(['/my-reservations']);
  }
}
