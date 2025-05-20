import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import feather from 'feather-icons';
import { EventService } from '../../../services/event.service';
import { Event } from '../../../models/event.model';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
})
export class EventsComponent implements OnInit {
  events: Event[] = [];
  filteredEvents: Event[] = [];
  loading = false;
  error = '';
  searchQuery = '';
  selectedCategory = 'all';

  constructor(private eventService: EventService) {}

  ngOnInit() {
    this.loadEvents();
  }

  ngAfterViewInit() {
    feather.replace();
  }

  loadEvents() {
    this.loading = true;
    this.eventService.getAllEvents().subscribe({
      next: (events) => {
        this.events = events;
        this.filterEvents();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load events. Please try again.';
        this.loading = false;
      },
    });
  }

  filterEvents() {
    this.filteredEvents = this.events.filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        event.description
          .toLowerCase()
          .includes(this.searchQuery.toLowerCase());
      const matchesCategory =
        this.selectedCategory === 'all' ||
        event.category === this.selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }

  onSearch(query: string) {
    this.searchQuery = query;
    this.filterEvents();
  }

  onCategoryChange(category: string) {
    this.selectedCategory = category;
    this.filterEvents();
  }

  clearFilters() {
    this.searchQuery = '';
    this.selectedCategory = 'all';
    this.filterEvents();
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'upcoming':
        return 'status-upcoming';
      case 'ongoing':
        return 'status-ongoing';
      case 'completed':
        return 'status-completed';
      default:
        return '';
    }
  }
}
