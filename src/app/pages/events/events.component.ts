import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EventService } from '../../services/event.service';
import { CategoryService } from '../../services/category.service';
import { AuthService } from '../../services/auth.service';
import { ReservationService } from '../../services/reservation.service';
import { NotificationService } from '../../services/notification.service';
import { Event } from '../../models/event.model';
import { Category } from '../../models/category.model';
import { Reservation } from '../../models/reservation.model';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
})
export class EventsComponent implements OnInit {
  events: Event[] = [];
  categories: Category[] = [];
  selectedCategory: string = 'All';
  searchText: string = '';
  selectedDate: string = '';
  showCalendar: boolean = false;
  private _filteredEvents: Event[] = [];

  constructor(
    private eventService: EventService,
    private categoryService: CategoryService,
    private authService: AuthService,
    private reservationService: ReservationService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadEvents();
  }

  loadEvents(): void {
    this.eventService.getAllEvents().subscribe({
      next: (events) => {
        // Map category names to events
        this.events = events.map((event) => {
          const category = this.categories.find(
            (c) => c.id.toString() === event.categoryId
          );
          return {
            ...event,
            category: category ? category.name : 'Unknown Category',
          };
        });
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error loading events:', error);
      },
    });
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        // Reload events after categories are loaded to map names
        if (this.events.length > 0) {
          this.mapCategoryNamesToEvents();
        }
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      },
    });
  }

  mapCategoryNamesToEvents(): void {
    this.events = this.events.map((event) => {
      const category = this.categories.find(
        (c) => c.id.toString() === event.categoryId
      );
      return {
        ...event,
        category: category ? category.name : 'Unknown Category',
      };
    });
    this.applyFilters();
  }

  filterByCategory(categoryId: string): void {
    this.selectedCategory = categoryId;
    this.applyFilters();
  }

  onSearch(): void {
    this.applyFilters();
  }

  toggleCalendar(): void {
    this.showCalendar = !this.showCalendar;
  }

  onDateChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    this._filteredEvents = this.events.filter((event) => {
      const matchesCategory =
        this.selectedCategory === 'All' ||
        event.categoryId === this.selectedCategory;
      const matchesSearch =
        !this.searchText ||
        event.title.toLowerCase().includes(this.searchText.toLowerCase()) ||
        event.description.toLowerCase().includes(this.searchText.toLowerCase());
      const matchesDate =
        !this.selectedDate ||
        event.date.toISOString().split('T')[0] === this.selectedDate;
      return matchesCategory && matchesSearch && matchesDate;
    });
  }

  get filteredEvents(): Event[] {
    return this._filteredEvents;
  }

  getCategoryName(categoryId: string): string {
    const category = this.categories.find(
      (cat) => cat.id.toString() === categoryId
    );
    return category ? category.name : 'Unknown Category';
  }

  isEventPassed(event: Event): boolean {
    const eventDate = new Date(event.date);
    const eventEndTime = new Date(event.date + 'T' + event.endTime);
    const now = new Date();
    return eventEndTime < now;
  }

  reserveEvent(event: Event): void {
    // Check if event is in the past
    if (this.isEventPassed(event)) {
      this.notificationService.warning('This event has already passed');
      return;
    }

    // Check if user is logged in
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.notificationService.warning('Please log in to reserve this event');
      this.router.navigate(['/login']);
      return;
    }

    console.log('Creating reservation for user:', currentUser);

    // Default to 1 ticket if not specified
    const numberOfTickets = 1;
    const totalPrice = event.price * numberOfTickets;

    // Create a new reservation with explicit typing
    const reservation: Partial<Reservation> = {
      eventId: event.id,
      userId: currentUser.id,
      eventName: event.title,
      eventDate: event.date,
      numberOfGuests: numberOfTickets,
      numberOfTickets: numberOfTickets,
      totalPrice: totalPrice,
      status: 'pending' as 'pending' | 'confirmed' | 'cancelled',
      paymentStatus: 'pending' as 'pending' | 'paid' | 'refunded',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log('Reservation payload:', reservation);

    // Call the reservation service to create the reservation
    this.reservationService.createReservation(reservation).subscribe({
      next: (createdReservation) => {
        console.log('Reservation created successfully:', createdReservation);
        this.notificationService.success(
          `Reservation for "${event.title}" created successfully!`
        );

        // Give the user time to see the notification before navigating
        setTimeout(() => {
          this.router.navigate(['/my-reservations']);
        }, 1500);
      },
      error: (error) => {
        console.error('Error creating reservation:', error);
        this.notificationService.error(
          'Failed to create reservation. Please try again.'
        );
      },
    });
  }
}
