import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Reservation } from '../models/reservation.model';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  private apiUrl = 'http://localhost:3000/reservations';

  constructor(private http: HttpClient, private authService: AuthService) {}

  getUserReservations(): Observable<Reservation[]> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      console.log('No user found, returning empty reservations');
      return new Observable((observer) => {
        observer.next([]);
        observer.complete();
      });
    }

    console.log('Fetching reservations for user:', currentUser);

    return this.http.get<Reservation[]>(this.apiUrl).pipe(
      map((reservations) => {
        console.log('All reservations:', reservations);
        // Convert IDs to strings for safe comparison
        const userReservations = reservations.filter((reservation) => {
          const match = String(reservation.userId) === String(currentUser.id);
          console.log(
            `Reservation ${reservation.id}, userId: ${reservation.userId}, currentUser.id: ${currentUser.id}, match: ${match}`
          );
          return match;
        });
        console.log('User reservations:', userReservations);
        return userReservations;
      })
    );
  }

  getReservationById(id: string): Observable<Reservation> {
    return this.http.get<Reservation>(`${this.apiUrl}/${id}`);
  }

  createReservation(
    reservation: Partial<Reservation>
  ): Observable<Reservation> {
    return this.http.post<Reservation>(this.apiUrl, reservation);
  }

  updateReservation(
    id: string,
    reservation: Partial<Reservation>
  ): Observable<Reservation> {
    return this.http.patch<Reservation>(`${this.apiUrl}/${id}`, reservation);
  }

  updatePaymentStatus(
    id: string,
    paymentStatus: 'pending' | 'paid' | 'refunded'
  ): Observable<Reservation> {
    const status = paymentStatus === 'paid' ? 'confirmed' : 'pending';
    return this.http.patch<Reservation>(`${this.apiUrl}/${id}`, {
      paymentStatus,
      status,
    });
  }

  cancelReservation(id: string): Observable<Reservation> {
    return this.http.patch<Reservation>(`${this.apiUrl}/${id}`, {
      status: 'cancelled',
      paymentStatus: 'refunded',
    });
  }

  deleteReservation(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getAllReservations(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
