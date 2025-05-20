import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService } from '../../../services/event.service';
import { VenueService } from '../../../services/venue.service';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';

interface Event {
  id: number;
  title: string;
  description: string;
  venueId: number;
  ownerId?: string;
  date: string;
  isVerified: boolean;
  rejected?: boolean;
  status?: string;
  rejectionComment?: string;
  // Add other fields as needed
}

@Component({
  selector: 'app-event-verification',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './event-verification.component.html',
  styleUrls: ['./event-verification.component.scss'],
  providers: [EventService, VenueService],
})
export class EventVerificationComponent implements OnInit {
  events: (Event & { venueName?: string })[] = [];
  venues: any[] = [];

  // Modal state for rejection
  showRejectModal = false;
  rejectEventId: string | null = null;
  rejectComment: string = '';

  constructor(
    private eventService: EventService,
    private venueService: VenueService
  ) {}

  ngOnInit() {
    this.loadEventsWithVenues();
  }

  loadEventsWithVenues() {
    this.venueService.getAllVenues().subscribe((venues) => {
      this.venues = venues;
      this.eventService.getAllEvents().subscribe((events: any[]) => {
        this.events = events.map((event) => ({
          ...event,
          venueName: this.getVenueName(event.venueId),
        }));
      });
    });
  }

  getVenueName(venueId: string | number): string {
    const venue = this.venues.find((v) => v.id == venueId);
    return venue ? venue.name : '-';
  }

  approveEvent(id: number) {
    const eventId = id.toString();
    this.eventService
      .updateEvent(eventId, { status: 'accepted', rejectionComment: '' })
      .subscribe(() => {
        // Update local event instantly
        const event = this.events.find((e) => e.id == id);
        if (event) {
          event.status = 'accepted';
          event.rejectionComment = '';
        }
      });
  }

  rejectEvent(id: number) {
    this.rejectEventId = id.toString();
    this.rejectComment = '';
    this.showRejectModal = true;
  }

  closeRejectModal() {
    this.showRejectModal = false;
    this.rejectEventId = null;
    this.rejectComment = '';
  }

  confirmReject() {
    if (!this.rejectEventId) return;
    this.eventService
      .updateEvent(this.rejectEventId, {
        status: 'rejected',
        rejectionComment: this.rejectComment,
      })
      .subscribe(() => {
        // Update local event instantly
        const event = this.events.find(
          (e) => e.id.toString() === this.rejectEventId
        );
        if (event) {
          event.status = 'rejected';
          event.rejectionComment = this.rejectComment;
        }
        this.closeRejectModal();
      });
  }

  deleteEvent(id: number) {
    this.eventService.deleteEvent(id.toString()).subscribe(() => {
      this.loadEventsWithVenues();
    });
  }
}
