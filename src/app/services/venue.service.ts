import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Venue } from '../models/venue.model';

@Injectable({
  providedIn: 'root',
})
export class VenueService {
  private apiUrl = 'http://localhost:3000/venues';

  constructor(private http: HttpClient) {}

  getAllVenues(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  approveVenue(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, { isVerified: true });
  }

  rejectVenue(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, {
      isVerified: false,
      rejected: true,
    });
  }

  deleteVenue(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  updateVenue(id: string, data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, data);
  }

  createVenue(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  getVenuesByOwner(ownerId: string): Observable<Venue[]> {
    return this.http.get<Venue[]>(`${this.apiUrl}?ownerId=${ownerId}`);
  }

  getVenueById(id: string): Observable<Venue> {
    return this.http.get<Venue>(`${this.apiUrl}/${id}`);
  }
}
