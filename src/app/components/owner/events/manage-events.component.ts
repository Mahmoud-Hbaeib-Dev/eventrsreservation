import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EventService } from '../../../services/event.service';
import { AuthService } from '../../../services/auth.service';
import { VenueService } from '../../../services/venue.service';
import { FormsModule } from '@angular/forms';
import { Event } from '../../../models/event.model';

@Component({
  selector: 'app-manage-events',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-events.component.html',
  styleUrls: ['./manage-events.component.scss'],
})
export class ManageEventsComponent implements OnInit {
  events: Event[] = [];
  loading = false;
  error = '';
  ownerVenueId: string | null = null;

  // Modal state
  showEditModal = false;
  eventToEdit: Event | null = null;

  constructor(
    private eventService: EventService,
    private authService: AuthService,
    private venueService: VenueService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit() {
    this.fetchOwnerVenueAndEvents();
  }

  fetchOwnerVenueAndEvents() {
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
        if (venues.length > 0) {
          this.ownerVenueId = venues[0].id;
          this.fetchEvents();
        } else {
          this.error = 'You need to create a venue first.';
          this.loading = false;
        }
      },
      error: (err) => {
        this.error = 'Failed to load venue.';
        this.loading = false;
      },
    });
  }

  fetchEvents() {
    this.eventService.getAllEvents().subscribe({
      next: (events) => {
        this.events = events.filter(
          (e) => String(e.venueId) === String(this.ownerVenueId)
        );
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load events.';
        this.loading = false;
      },
    });
  }

  editEvent(eventId: number) {
    this.eventToEdit = this.events.find((e) => e.id === eventId) || null;
    this.showEditModal = true;
  }

  deleteEvent(eventId: number) {
    if (!confirm('Are you sure you want to delete this event?')) return;
    this.eventService.deleteEvent(eventId.toString()).subscribe({
      next: () => {
        this.snackBar.open('Event deleted!', 'Close', {
          duration: 2000,
          panelClass: 'snackbar-success',
        });
        this.fetchEvents();
      },
      error: () => {
        this.snackBar.open('Failed to delete event.', 'Close', {
          duration: 3000,
          panelClass: 'snackbar-error',
        });
      },
    });
  }

  onEditSubmit() {
    if (!this.eventToEdit) return;
    this.eventService
      .updateEvent(this.eventToEdit.id.toString(), this.eventToEdit)
      .subscribe({
        next: () => {
          this.snackBar.open('Event updated!', 'Close', {
            duration: 2000,
            panelClass: 'snackbar-success',
          });
          this.closeEditModal();
          this.fetchEvents();
        },
        error: () => {
          this.snackBar.open('Failed to update event.', 'Close', {
            duration: 3000,
            panelClass: 'snackbar-error',
          });
        },
      });
  }

  closeEditModal() {
    this.showEditModal = false;
    this.eventToEdit = null;
  }
}
