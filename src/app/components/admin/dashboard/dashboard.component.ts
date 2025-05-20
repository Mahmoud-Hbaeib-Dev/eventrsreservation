import {
  Component,
  OnInit,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Pipe, PipeTransform } from '@angular/core';
import feather from 'feather-icons';
import { ChartModule } from 'primeng/chart';
import { ChartData, ChartOptions, TooltipItem } from 'chart.js';
import { UserService } from '../../../services/user.service';
import { EventService } from '../../../services/event.service';
import { VenueService } from '../../../services/venue.service';
import { ReservationService } from '../../../services/reservation.service';

type FeatherIconName = keyof typeof feather.icons;

@Pipe({
  name: 'abs',
  standalone: true,
})
export class AbsPipe implements PipeTransform {
  transform(value: number | undefined): number {
    return value ? Math.abs(value) : 0;
  }
}

interface StatCard {
  title: string;
  value: number;
  icon: FeatherIconName;
  color: string;
  change: number;
}

interface RecentActivity {
  type: 'event' | 'user' | 'venue' | 'report';
  title: string;
  time: string;
  description: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, AbsPipe, ChartModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, AfterViewInit {
  stats: StatCard[] = [
    {
      title: 'Total Events',
      value: 0,
      icon: 'calendar',
      color: '#00ffb8',
      change: 12,
    },
    {
      title: 'Active Users',
      value: 0,
      icon: 'users',
      color: '#00b8ff',
      change: 8,
    },
    {
      title: 'Venues',
      value: 0,
      icon: 'map-pin',
      color: '#8e54e9',
      change: 3,
    },
    {
      title: 'Revenue',
      value: 0,
      icon: 'dollar-sign',
      color: '#ff5e62',
      change: -2,
    },
  ];

  recentActivities: RecentActivity[] = [
    {
      type: 'event',
      title: 'New Event Created',
      time: '2 hours ago',
      description: 'Summer Music Festival 2024 has been created',
    },
    {
      type: 'user',
      title: 'New User Registration',
      time: '3 hours ago',
      description: 'John Doe has registered as a venue owner',
    },
    {
      type: 'venue',
      title: 'Venue Update',
      time: '5 hours ago',
      description: 'Grand Ballroom has updated their availability',
    },
    {
      type: 'report',
      title: 'Monthly Report',
      time: '1 day ago',
      description: 'January 2024 revenue report is ready',
    },
  ];

  // Chart Data
  eventRegistrationsData: any;
  eventRegistrationsOptions: any;

  eventCategoriesData: any;
  eventCategoriesOptions: any;

  revenueByVenueData: any;
  revenueByVenueOptions: any;

  userGenderData: any;
  userGenderOptions: any;

  constructor(
    private cdr: ChangeDetectorRef,
    private router: Router,
    private userService: UserService,
    private eventService: EventService,
    private venueService: VenueService,
    private reservationService: ReservationService
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadEventCreationAnalytics();
    this.loadUserGenderAnalytics();
    this.loadEventCategoriesAnalytics();
    this.loadRevenueByVenueAnalytics();
  }

  ngAfterViewInit(): void {
    this.initializeIcons();
  }

  private initializeIcons(): void {
    // Wait for the view to be fully rendered
    setTimeout(() => {
      const icons = document.querySelectorAll('[data-feather]');
      icons.forEach((icon) => {
        const name = icon.getAttribute('data-feather') as FeatherIconName;
        if (name && name in feather.icons) {
          icon.innerHTML = feather.icons[name].toSvg();
        }
      });
      this.cdr.detectChanges();
    });
  }

  private initializeCharts(): void {
    // Event Registrations Line Chart
    this.eventRegistrationsData = {
      labels: ['January', 'February', 'March', 'April', 'May', 'June'],
      datasets: [
        {
          label: 'Event Registrations',
          data: [65, 59, 80, 81, 56, 55],
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

    this.eventRegistrationsOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: 'rgba(30, 36, 50, 0.95)',
          titleColor: '#00ffb8',
          bodyColor: '#e6f6ff',
          borderColor: 'rgba(0, 255, 184, 0.2)',
          borderWidth: 1,
          padding: 12,
          displayColors: false,
          callbacks: {
            label: function (context: TooltipItem<'line'>) {
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
          ticks: {
            color: '#b0b8c9',
            font: {
              size: 11,
            },
          },
          grid: {
            color: 'rgba(176, 184, 201, 0.1)',
            drawBorder: false,
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: '#b0b8c9',
            font: {
              size: 11,
            },
            callback: function (value: number) {
              return value + ' events';
            },
          },
          grid: {
            color: 'rgba(176, 184, 201, 0.1)',
            drawBorder: false,
          },
        },
      },
      animation: {
        duration: 2000,
        easing: 'easeInOutQuart',
      },
    };

    // Event Categories Pie Chart
    this.eventCategoriesData = {
      labels: ['Music', 'Sports', 'Business', 'Arts', 'Food'],
      datasets: [
        {
          data: [300, 50, 100, 40, 120],
          backgroundColor: [
            '#00ffb8',
            '#00b8ff',
            '#8e54e9',
            '#ff5e62',
            '#ff9966',
          ],
          borderWidth: 0,
          hoverOffset: 15,
        },
      ],
    };

    this.eventCategoriesOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: '#b0b8c9',
            padding: 20,
            font: {
              size: 11,
            },
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
            label: function (context: TooltipItem<'pie'>) {
              const total = context.dataset.data.reduce(
                (a: number, b: number) => a + b,
                0
              );
              const percentage = Math.round((context.parsed * 100) / total);
              return `${context.label}: ${context.parsed} (${percentage}%)`;
            },
          },
        },
      },
      animation: {
        animateRotate: true,
        animateScale: true,
        duration: 2000,
        easing: 'easeInOutQuart',
      },
    };

    // Revenue by Venue Bar Chart
    this.revenueByVenueData = {
      labels: [
        'Grand Ballroom',
        'Sky Lounge',
        'Garden Hall',
        'Ocean View',
        'City Center',
      ],
      datasets: [
        {
          label: 'Revenue',
          data: [54000, 36000, 28000, 42000, 32000],
          backgroundColor: [
            'rgba(0, 255, 184, 0.8)',
            'rgba(0, 184, 255, 0.8)',
            'rgba(142, 84, 233, 0.8)',
            'rgba(255, 94, 98, 0.8)',
            'rgba(255, 153, 102, 0.8)',
          ],
          borderRadius: 6,
          borderSkipped: false,
          barThickness: 20,
          maxBarThickness: 30,
        },
      ],
    };

    this.revenueByVenueOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: 'rgba(30, 36, 50, 0.95)',
          titleColor: '#e6f6ff',
          bodyColor: '#e6f6ff',
          borderColor: 'rgba(0, 255, 184, 0.2)',
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label: function (context: TooltipItem<'bar'>) {
              return `Revenue: $${context.parsed.y.toLocaleString()}`;
            },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: '#b0b8c9',
            font: {
              size: 11,
            },
            maxRotation: 45,
            minRotation: 45,
          },
          grid: {
            display: false,
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: '#b0b8c9',
            font: {
              size: 11,
            },
            callback: function (value: number) {
              return '$' + value.toLocaleString();
            },
          },
          grid: {
            color: 'rgba(176, 184, 201, 0.1)',
            drawBorder: false,
          },
        },
      },
      animation: {
        duration: 2000,
        easing: 'easeInOutQuart',
      },
    };
  }

  loadStats() {
    this.userService.getAllUsers().subscribe((users) => {
      console.log('Users:', users);
      this.stats[1].value = users.length;
    });
    this.eventService.getAllEvents().subscribe((events) => {
      console.log('Events:', events);
      this.stats[0].value = events.length;
    });
    this.venueService.getAllVenues().subscribe((venues) => {
      console.log('Venues:', venues);
      this.stats[2].value = venues.length;
    });
    this.reservationService.getAllReservations().subscribe((reservations) => {
      const revenue = reservations.reduce(
        (sum, r) => sum + (r.totalPrice || 0),
        0
      );
      console.log('Reservations:', reservations, 'Revenue:', revenue);
      this.stats[3].value = revenue;
    });
  }

  loadEventCreationAnalytics(): void {
    this.eventService.getAllEvents().subscribe((events: any[]) => {
      // Group events by month
      const monthLabels = [
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
      const counts: number[] = Array(12).fill(0);
      events.forEach((event) => {
        if (event.createdAt) {
          const date = new Date(event.createdAt);
          const month = date.getMonth();
          counts[month]++;
        }
      });
      this.eventRegistrationsData = {
        labels: monthLabels,
        datasets: [
          {
            label: 'Events Created',
            data: counts,
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
      this.eventRegistrationsOptions = {
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
                return `Events Created: ${context.parsed.y}`;
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
    });
  }

  loadUserGenderAnalytics(): void {
    this.userService.getAllUsers().subscribe((users: any[]) => {
      const genderCounts = { male: 0, female: 0, other: 0 };
      users.forEach((user) => {
        if (user.gender === 'male') genderCounts.male++;
        else if (user.gender === 'female') genderCounts.female++;
        else genderCounts.other++;
      });
      this.userGenderData = {
        labels: ['Male', 'Female', 'Other'],
        datasets: [
          {
            data: [genderCounts.male, genderCounts.female, genderCounts.other],
            backgroundColor: [
              '#00b8ff', // Male
              '#ff5e62', // Female
              '#8e54e9', // Other
            ],
            borderWidth: 0,
            hoverOffset: 15,
          },
        ],
      };
      this.userGenderOptions = {
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
                const total = context.dataset.data.reduce(
                  (a: number, b: number) => a + b,
                  0
                );
                const percentage = total
                  ? Math.round((context.parsed * 100) / total)
                  : 0;
                return `${context.label}: ${context.parsed} (${percentage}%)`;
              },
            },
          },
        },
        animation: {
          animateRotate: true,
          animateScale: true,
          duration: 2000,
          easing: 'easeInOutQuart',
        },
      };
    });
  }

  loadEventCategoriesAnalytics(): void {
    this.eventService.getAllEvents().subscribe((events: any[]) => {
      const categoryCounts: { [key: string]: number } = {};
      events.forEach((event) => {
        const cat = event.category || 'Other';
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });
      const labels = Object.keys(categoryCounts);
      const data = Object.values(categoryCounts);
      this.eventCategoriesData = {
        labels,
        datasets: [
          {
            data,
            backgroundColor: [
              '#00ffb8',
              '#00b8ff',
              '#8e54e9',
              '#ff5e62',
              '#ff9966',
              '#f7b731',
              '#20bf6b',
              '#8854d0',
              '#fd9644',
              '#a55eea',
            ],
            borderWidth: 0,
            hoverOffset: 15,
          },
        ],
      };
      this.eventCategoriesOptions = {
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
                const total = context.dataset.data.reduce(
                  (a: number, b: number) => a + b,
                  0
                );
                const percentage = total
                  ? Math.round((context.parsed * 100) / total)
                  : 0;
                return `${context.label}: ${context.parsed} (${percentage}%)`;
              },
            },
          },
        },
        animation: {
          animateRotate: true,
          animateScale: true,
          duration: 2000,
          easing: 'easeInOutQuart',
        },
      };
    });
  }

  loadRevenueByVenueAnalytics(): void {
    this.venueService.getAllVenues().subscribe((venues: any[]) => {
      this.reservationService
        .getAllReservations()
        .subscribe((reservations: any[]) => {
          this.eventService.getAllEvents().subscribe((events: any[]) => {
            // Map venueId to venue name
            const venueMap: { [key: string]: string } = {};
            venues.forEach((venue) => {
              venueMap[venue.id] = venue.name;
            });
            // Map eventId to venueId
            const eventVenueMap: { [key: string]: string } = {};
            events.forEach((event) => {
              eventVenueMap[event.id] = event.venueId;
            });
            // Sum revenue per venue
            const revenueByVenue: { [key: string]: number } = {};
            reservations.forEach((reservation) => {
              const eventId = reservation.eventId;
              const venueId = eventVenueMap[eventId];
              const venueName = venueMap[venueId] || 'Unknown';
              revenueByVenue[venueName] =
                (revenueByVenue[venueName] || 0) +
                (reservation.totalPrice || 0);
            });
            const labels = Object.keys(revenueByVenue);
            const data = Object.values(revenueByVenue);
            this.revenueByVenueData = {
              labels,
              datasets: [
                {
                  label: 'Revenue',
                  data,
                  backgroundColor: [
                    'rgba(0, 255, 184, 0.8)',
                    'rgba(0, 184, 255, 0.8)',
                    'rgba(142, 84, 233, 0.8)',
                    'rgba(255, 94, 98, 0.8)',
                    'rgba(255, 153, 102, 0.8)',
                    'rgba(247, 183, 49, 0.8)',
                    'rgba(32, 191, 107, 0.8)',
                    'rgba(136, 84, 208, 0.8)',
                    'rgba(253, 150, 68, 0.8)',
                    'rgba(165, 94, 234, 0.8)',
                  ],
                  borderRadius: 6,
                  borderSkipped: false,
                  barThickness: 20,
                  maxBarThickness: 30,
                },
              ],
            };
            this.revenueByVenueOptions = {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: {
                  backgroundColor: 'rgba(30, 36, 50, 0.95)',
                  titleColor: '#e6f6ff',
                  bodyColor: '#e6f6ff',
                  borderColor: 'rgba(0, 255, 184, 0.2)',
                  borderWidth: 1,
                  padding: 12,
                  callbacks: {
                    label: function (context: any) {
                      return `Revenue: $${context.parsed.y.toLocaleString()}`;
                    },
                  },
                },
              },
              scales: {
                x: {
                  ticks: {
                    color: '#b0b8c9',
                    font: { size: 11 },
                    maxRotation: 45,
                    minRotation: 45,
                  },
                  grid: { display: false },
                },
                y: {
                  beginAtZero: true,
                  ticks: {
                    color: '#b0b8c9',
                    font: { size: 11 },
                    callback: function (value: number) {
                      return '$' + value.toLocaleString();
                    },
                  },
                  grid: {
                    color: 'rgba(176, 184, 201, 0.1)',
                    drawBorder: false,
                  },
                },
              },
              animation: {
                duration: 2000,
                easing: 'easeInOutQuart',
              },
            };
          });
        });
    });
  }

  getActivityIcon(type: string): FeatherIconName {
    const iconMap: { [key: string]: FeatherIconName } = {
      event: 'calendar',
      user: 'user',
      venue: 'map-pin',
      report: 'bar-chart-2',
    };
    return iconMap[type] || 'info';
  }

  get isProfileRoute(): boolean {
    return this.router.url.startsWith('/admin/profile');
  }
}
