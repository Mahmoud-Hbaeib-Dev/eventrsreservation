import {
  Component,
  OnInit,
  ChangeDetectorRef,
  Pipe,
  PipeTransform,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const feather = require('feather-icons'); // TODO: Switch to ESM import when available
import { ChartModule } from 'primeng/chart';
import { VenueService } from '../../../services/venue.service';
import { EventService } from '../../../services/event.service';
import { ReservationService } from '../../../services/reservation.service';
import { AuthService } from '../../../services/auth.service';

@Pipe({
  name: 'abs',
  standalone: true,
})
export class AbsPipe implements PipeTransform {
  transform(value: number | undefined): number {
    return value ? Math.abs(value) : 0;
  }
}

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ChartModule, AbsPipe],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  stats = [
    {
      title: 'My Events',
      value: 5,
      icon: 'calendar',
      color: '#00ffb8',
      change: 10,
    },
    {
      title: 'My Reservations',
      value: 12,
      icon: 'clipboard',
      color: '#00b8ff',
      change: 5,
    },
    {
      title: 'Revenue',
      value: 3200,
      icon: 'dollar-sign',
      color: '#ff5e62',
      change: 3,
    },
  ];

  eventRegistrationsData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June'],
    datasets: [
      {
        label: 'Event Registrations',
        data: [2, 3, 5, 4, 6, 7],
        fill: true,
        borderColor: '#00ffb8',
        tension: 0.4,
        backgroundColor: 'rgba(0, 255, 184, 0.1)',
        pointBackgroundColor: '#00ffb8',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#00ffb8',
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2,
      },
    ],
  };

  eventRegistrationsOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(30, 36, 50, 0.95)',
        titleColor: '#00ffb8',
        bodyColor: '#e6f6ff',
        borderColor: 'rgba(0, 255, 184, 0.2)',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: function (context: any) {
            return `Registrations: ${context.parsed.y}`;
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
    scales: {
      x: {
        ticks: { color: '#b0b8c9', font: { size: 11 } },
        grid: { color: 'rgba(176, 184, 201, 0.1)', drawBorder: false },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: '#b0b8c9',
          font: { size: 11 },
          callback: function (value: number) {
            return value + ' events';
          },
        },
        grid: { color: 'rgba(176, 184, 201, 0.1)', drawBorder: false },
      },
    },
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart',
    },
  };

  revenueByEventTypeData = {
    labels: [] as string[],
    datasets: [
      {
        label: 'Revenue by Event Type',
        data: [] as number[],
        backgroundColor: [
          'rgba(0, 255, 184, 0.8)',
          'rgba(0, 184, 255, 0.8)',
          'rgba(255, 94, 98, 0.8)',
          'rgba(255, 153, 102, 0.8)',
          'rgba(142, 84, 233, 0.8)',
          'rgba(255, 193, 7, 0.8)',
          'rgba(76, 175, 80, 0.8)',
          'rgba(156, 39, 176, 0.8)',
        ],
        borderColor: [
          'rgba(0, 255, 184, 1)',
          'rgba(0, 184, 255, 1)',
          'rgba(255, 94, 98, 1)',
          'rgba(255, 153, 102, 1)',
          'rgba(142, 84, 233, 1)',
          'rgba(255, 193, 7, 1)',
          'rgba(76, 175, 80, 1)',
          'rgba(156, 39, 176, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  revenueByEventTypeOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#b0b8c9',
          padding: 20,
          font: { size: 11 },
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(30, 36, 50, 0.95)',
        titleColor: '#e6f6ff',
        bodyColor: '#e6f6ff',
        borderColor: 'rgba(0, 255, 184, 0.2)',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: function (context: any) {
            const value = context.parsed.y;
            const total = context.dataset.data.reduce(
              (a: number, b: number) => a + b,
              0
            );
            const percentage = total ? Math.round((value * 100) / total) : 0;
            return [
              `Revenue: $${value.toLocaleString()}`,
              `Percentage: ${percentage}%`,
            ];
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#b0b8c9',
          font: { size: 11 },
          callback: function (value: number) {
            return '$' + value.toLocaleString();
          },
        },
        grid: { color: 'rgba(176, 184, 201, 0.1)', drawBorder: false },
      },
      x: {
        ticks: { color: '#b0b8c9', font: { size: 11 } },
        grid: { color: 'rgba(176, 184, 201, 0.1)', drawBorder: false },
      },
    },
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart',
    },
  };

  recentActivities = [
    {
      type: 'event',
      title: 'New Event Created',
      time: '2 hours ago',
      description: 'You created the event "Spring Gala".',
    },
    {
      type: 'reservation',
      title: 'Reservation Received',
      time: '3 hours ago',
      description: 'A new reservation was made for "Spring Gala".',
    },
    {
      type: 'venue',
      title: 'Venue Updated',
      time: '5 hours ago',
      description: 'You updated your venue "Sky Lounge".',
    },
    {
      type: 'report',
      title: 'Monthly Report',
      time: '1 day ago',
      description: 'Your April 2025 revenue report is ready.',
    },
  ];

  // Add new properties for dynamic updates
  private updateInterval: any;
  private lastUpdateTime: Date = new Date();

  constructor(
    private cdr: ChangeDetectorRef,
    private router: Router,
    private venueService: VenueService,
    private eventService: EventService,
    private reservationService: ReservationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadOwnerDashboardData();
    // Set up periodic updates
    this.updateInterval = setInterval(() => {
      this.checkForUpdates();
    }, 30000); // Check every 30 seconds
  }

  ngAfterViewInit(): void {
    feather.replace();
  }

  ngOnDestroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  private checkForUpdates(): void {
    const currentTime = new Date();
    const timeDiff = currentTime.getTime() - this.lastUpdateTime.getTime();

    // Only update if more than 1 minute has passed
    if (timeDiff > 60000) {
      this.loadOwnerDashboardData();
      this.lastUpdateTime = currentTime;
    }
  }

  loadOwnerDashboardData(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;
    const ownerId = currentUser.id;

    // Combine all observables to handle data loading more efficiently
    this.venueService.getAllVenues().subscribe((venues: any[]) => {
      const myVenues = venues.filter(
        (v: any) => v.ownerId == ownerId || v.ownerId == +ownerId
      );
      const myVenueIds = myVenues.map((v: any) => v.id.toString());

      this.eventService.getAllEvents().subscribe((events: any[]) => {
        const myEvents = events.filter((e: any) =>
          myVenueIds.includes(e.venueId.toString())
        );
        const myEventIds = myEvents.map((e: any) => e.id.toString());

        this.reservationService
          .getAllReservations()
          .subscribe((reservations: any[]) => {
            const myReservations = reservations.filter((r: any) =>
              myEventIds.includes(r.eventId.toString())
            );

            // Update stats
            this.updateStats(myEvents, myReservations);

            // Update event registrations chart
            this.updateEventRegistrationsChart(myReservations);

            // Update revenue by event type chart
            this.updateRevenueByEventTypeChart(myEvents, myReservations);

            this.refreshIcons();
          });
      });
    });
  }

  private updateStats(myEvents: any[], myReservations: any[]): void {
    const totalRevenue = myReservations.reduce(
      (sum, r) => sum + (r.totalPrice || 0),
      0
    );

    this.stats = [
      {
        title: 'My Events',
        value: myEvents.length,
        icon: 'calendar',
        color: '#00ffb8',
        change: this.calculateChange(myEvents.length, 'events'),
      },
      {
        title: 'My Reservations',
        value: myReservations.length,
        icon: 'clipboard',
        color: '#00b8ff',
        change: this.calculateChange(myReservations.length, 'reservations'),
      },
      {
        title: 'Revenue',
        value: totalRevenue,
        icon: 'dollar-sign',
        color: '#ff5e62',
        change: this.calculateChange(totalRevenue, 'revenue'),
      },
    ];
  }

  private updateRevenueByEventTypeChart(
    myEvents: any[],
    myReservations: any[]
  ): void {
    // Create a map of event types and their revenue
    const revenueByType = new Map<string, number>();

    // Initialize with all possible event types
    const eventTypes = [
      'Weddings',
      'Corporate',
      'Birthdays',
      'Conferences',
      'Other',
    ];
    eventTypes.forEach((type) => revenueByType.set(type, 0));

    // Calculate revenue for each event type
    myReservations.forEach((r) => {
      const event = myEvents.find((e) => e.id === r.eventId);
      if (event) {
        const eventType = event.type || 'Other';
        const currentRevenue = revenueByType.get(eventType) || 0;
        revenueByType.set(eventType, currentRevenue + (r.totalPrice || 0));
      }
    });

    // Filter out event types with zero revenue
    const filteredTypes = Array.from(revenueByType.entries())
      .filter(([_, revenue]) => revenue > 0)
      .sort((a, b) => b[1] - a[1]); // Sort by revenue descending

    // Update chart data
    this.revenueByEventTypeData = {
      labels: filteredTypes.map(([type]) => type),
      datasets: [
        {
          label: 'Revenue by Event Type',
          data: filteredTypes.map(([_, revenue]) => revenue),
          backgroundColor:
            this.revenueByEventTypeData.datasets[0].backgroundColor.slice(
              0,
              filteredTypes.length
            ),
          borderColor:
            this.revenueByEventTypeData.datasets[0].borderColor.slice(
              0,
              filteredTypes.length
            ),
          borderWidth: 1,
        },
      ],
    };
  }

  private calculateChange(currentValue: number, metric: string): number {
    // TODO: Implement actual change calculation by comparing with previous period
    // For now, return a random change for demonstration
    return Math.floor(Math.random() * 20) - 10;
  }

  private updateEventRegistrationsChart(myReservations: any[]): void {
    const registrationsByMonth: { [key: string]: number } = {};
    myReservations.forEach((r) => {
      const date = new Date(r.createdAt);
      const month = date.toLocaleString('default', { month: 'long' });
      registrationsByMonth[month] = (registrationsByMonth[month] || 0) + 1;
    });

    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    this.eventRegistrationsData = {
      labels: months,
      datasets: [
        {
          label: 'Event Registrations',
          data: months.map((m) => registrationsByMonth[m] || 0),
          fill: true,
          borderColor: '#00ffb8',
          tension: 0.4,
          backgroundColor: 'rgba(0, 255, 184, 0.1)',
          pointBackgroundColor: '#00ffb8',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#00ffb8',
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2,
        },
      ],
    };
  }

  // If you update stats or chart data after HTTP requests, call this method:
  refreshIcons() {
    this.cdr.detectChanges();
    feather.replace();
  }

  getActivityIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      event: 'calendar',
      user: 'user',
      venue: 'map-pin',
      report: 'bar-chart-2',
      reservation: 'clipboard',
    };
    return iconMap[type] || 'info';
  }
}
