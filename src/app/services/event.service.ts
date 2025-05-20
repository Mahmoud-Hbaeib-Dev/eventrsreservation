import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Event } from '../models/event.model';

@Injectable({ providedIn: 'root' })
export class EventService {
  private apiUrl = 'http://localhost:3000/events';
  constructor(private http: HttpClient) {}

  getAllEvents(): Observable<Event[]> {
    console.log('[GET] Fetching all events');
    return this.http
      .get<Event[]>(this.apiUrl)
      .pipe(tap((events) => console.log('[GET] Events received:', events)));
  }

  getEventById(id: string): Observable<Event> {
    console.log('[GET] Fetching event with id:', id);
    return this.http
      .get<Event>(`${this.apiUrl}/${id}`)
      .pipe(tap((event) => console.log('[GET] Event received:', event)));
  }

  approveEvent(id: string): Observable<Event> {
    console.log('[PATCH] Approving event with id:', id);
    return this.http
      .patch<Event>(`${this.apiUrl}/${id}`, {
        status: 'accepted',
        isVerified: true,
        rejectionComment: '',
      })
      .pipe(tap((res) => console.log('[PATCH] Event approved:', res)));
  }

  rejectEvent(id: string, rejectionComment: string): Observable<Event> {
    console.log('[PATCH] Rejecting event with id:', id);
    return this.http
      .patch<Event>(`${this.apiUrl}/${id}`, {
        status: 'rejected',
        isVerified: false,
        rejectionComment,
      })
      .pipe(tap((res) => console.log('[PATCH] Event rejected:', res)));
  }

  deleteEvent(id: string): Observable<Event> {
    console.log('[DELETE] Deleting event with id:', id);
    return this.http
      .delete<Event>(`${this.apiUrl}/${id}`)
      .pipe(tap((res) => console.log('[DELETE] Event deleted:', res)));
  }

  createEvent(event: Partial<Event>): Observable<Event> {
    console.log('[POST] Creating event:', event);
    // Ensure new events start with pending status
    const eventWithStatus = {
      ...event,
      status: 'pending',
      isVerified: false,
      rejectionComment: '',
    };
    return this.http
      .post<Event>(this.apiUrl, eventWithStatus)
      .pipe(tap((res) => console.log('[POST] Event created:', res)));
  }

  updateEvent(id: string, data: Partial<Event>): Observable<Event> {
    console.log('[PATCH] Updating event with id:', id, data);
    return this.http
      .patch<Event>(`${this.apiUrl}/${id}`, data)
      .pipe(tap((res) => console.log('[PATCH] Event updated:', res)));
  }
}
