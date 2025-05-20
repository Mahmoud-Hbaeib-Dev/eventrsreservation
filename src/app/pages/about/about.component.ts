import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="about-container">
      <!-- Hero Section -->
      <section class="about-hero">
        <div class="about-hero-bg"></div>
        <div class="about-hero-content">
          <h1><span class="gradient-text">About Our Event Platform</span></h1>
          <p class="subtitle">Connecting people to unforgettable experiences</p>
        </div>
      </section>

      <!-- Mission & Vision -->
      <section class="about-mission">
        <div class="mission-card">
          <i class="fas fa-bullseye icon"></i>
          <h2>Our Mission</h2>
          <p>
            To make discovering, booking, and enjoying events seamless and
            inspiring for everyone, everywhere.
          </p>
        </div>
        <div class="vision-card">
          <i class="fas fa-eye icon"></i>
          <h2>Our Vision</h2>
          <p>
            Empowering communities by bringing people together through
            world-class events and experiences.
          </p>
        </div>
      </section>

      <!-- Fun Stats -->
      <section class="about-stats">
        <div class="stats-grid">
          <div class="stat-card" *ngFor="let stat of stats">
            <i [class]="stat.icon + ' stat-icon'"></i>
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </section>

      <!-- Timeline/History -->
      <section class="about-timeline">
        <h2>Our Journey</h2>
        <div class="timeline">
          <div
            class="timeline-item"
            *ngFor="let item of timeline; let last = last"
          >
            <div class="timeline-dot"></div>
            <div class="timeline-line" *ngIf="!last"></div>
            <div class="timeline-content">
              <div class="timeline-date">{{ item.date }}</div>
              <div class="timeline-title">{{ item.title }}</div>
              <div class="timeline-desc">{{ item.desc }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Testimonials -->
      <section class="about-testimonials">
        <h2>What People Say</h2>
        <div class="testimonials-grid">
          <div class="testimonial-card" *ngFor="let t of testimonials">
            <img [src]="t.avatar" [alt]="t.name" class="testimonial-avatar" />
            <div class="testimonial-quote">“{{ t.quote }}”</div>
            <div class="testimonial-name">{{ t.name }}</div>
            <div class="testimonial-role">{{ t.role }}</div>
          </div>
        </div>
      </section>

      <!-- Team Section -->
      <section class="about-team">
        <h2>Meet the Team</h2>
        <div class="team-grid">
          <div class="team-member" *ngFor="let member of team">
            <img [src]="member.avatar" [alt]="member.name" />
            <h3>{{ member.name }}</h3>
            <p class="role">{{ member.role }}</p>
            <p class="bio">{{ member.bio }}</p>
          </div>
        </div>
      </section>

      <!-- Call to Action -->
      <section class="about-cta">
        <h2>Ready to discover your next event?</h2>
        <a routerLink="/events" class="cta-btn">Browse Events</a>
      </section>

      <!-- Partners Section -->
      <section class="about-partners">
        <h2>Our Partners</h2>
        <div class="partners-logos">
          <img
            *ngFor="let partner of partners"
            [src]="partner.logo"
            [alt]="partner.name"
            class="partner-logo"
          />
        </div>
      </section>

      <!-- Awards Section -->
      <section class="about-awards">
        <h2>Awards & Recognition</h2>
        <div class="awards-grid">
          <div class="award" *ngFor="let award of awards">
            <i [class]="award.icon + ' award-icon'"></i>
            <div class="award-title">{{ award.title }}</div>
            <div class="award-desc">{{ award.desc }}</div>
          </div>
        </div>
      </section>

      <!-- Social/Contact Section -->
      <section class="about-social">
        <h2>Connect With Us</h2>
        <div class="social-links">
          <a
            *ngFor="let social of socials"
            [href]="social.url"
            target="_blank"
            rel="noopener"
            [title]="social.name"
          >
            <i [class]="social.icon"></i>
          </a>
          <a href="mailto:info@eventplatform.com" class="email-link">
            info&#64;eventplatform.com
          </a>
        </div>
      </section>

      <!-- FAQ Section -->
      <section class="about-faq">
        <h2>Frequently Asked Questions</h2>
        <div class="faq-list">
          <div class="faq-item" *ngFor="let faq of faqs; let i = index">
            <div class="faq-question" (click)="toggleFaq(i)">
              <i
                class="fas"
                [ngClass]="{
                  'fa-chevron-down': !faq.open,
                  'fa-chevron-up': faq.open
                }"
              ></i>
              {{ faq.q }}
            </div>
            <div class="faq-answer" *ngIf="faq.open">{{ faq.a }}</div>
          </div>
        </div>
      </section>
    </div>
  `,
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent {
  team = [
    {
      name: 'Alex Johnson',
      role: 'Founder & CEO',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      bio: 'Passionate about building communities and creating memorable experiences.',
    },
    {
      name: 'Sara Lee',
      role: 'Lead Designer',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      bio: 'Designs with heart and a love for vibrant, user-friendly interfaces.',
    },
    {
      name: 'Mohamed Ali',
      role: 'Head of Engineering',
      avatar: 'https://randomuser.me/api/portraits/men/85.jpg',
      bio: 'Turns ideas into scalable, robust technology.',
    },
    {
      name: 'Emily Chen',
      role: 'Marketing Lead',
      avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
      bio: 'Spreads the word and connects people to great events.',
    },
  ];

  stats = [
    { icon: 'fas fa-ticket-alt', value: '10K+', label: 'Tickets Sold' },
    { icon: 'fas fa-calendar-alt', value: '500+', label: 'Events Hosted' },
    { icon: 'fas fa-city', value: '30+', label: 'Cities' },
    { icon: 'fas fa-smile', value: '99%', label: 'Happy Users' },
  ];

  timeline = [
    {
      date: '2021',
      title: 'Founded',
      desc: 'Our journey began with a vision to connect people to great events.',
    },
    {
      date: '2022',
      title: 'First 100 Events',
      desc: 'We celebrated our first major milestone with 100 events.',
    },
    {
      date: '2023',
      title: 'Expansion',
      desc: 'Expanded to new cities and grew our passionate team.',
    },
    {
      date: '2024',
      title: '10,000+ Tickets Sold',
      desc: 'Reached a new record and continue to grow!',
    },
  ];

  testimonials = [
    {
      name: 'Linda Park',
      role: 'Event Organizer',
      avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
      quote:
        'This platform made organizing and selling tickets a breeze! Highly recommended.',
    },
    {
      name: 'James Smith',
      role: 'Attendee',
      avatar: 'https://randomuser.me/api/portraits/men/41.jpg',
      quote: 'I found amazing events and the booking process was super smooth.',
    },
    {
      name: 'Amina Youssef',
      role: 'Partner',
      avatar: 'https://randomuser.me/api/portraits/women/22.jpg',
      quote: 'A fantastic team and a great experience working together!',
    },
  ];

  partners = [
    { name: 'Eventbrite', logo: 'assets/icons/eventbrite-svgrepo-com.svg' },
    { name: 'Meetup', logo: 'assets/icons/meetup-svgrepo-com.svg' },
    { name: 'Ticketmaster', logo: 'assets/icons/ticketmaster-ar21.svg' },
    {
      name: 'Google',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
    },
  ];

  awards = [
    {
      icon: 'fas fa-trophy',
      title: 'Best Event Platform 2023',
      desc: 'Awarded by Global Event Awards.',
    },
    {
      icon: 'fas fa-star',
      title: 'Top Rated by Users',
      desc: 'Consistently rated 5 stars by our community.',
    },
    {
      icon: 'fas fa-medal',
      title: 'Innovation in Tech',
      desc: 'Recognized for outstanding technology.',
    },
  ];

  socials = [
    {
      name: 'Facebook',
      icon: 'fab fa-facebook-f',
      url: 'https://facebook.com',
    },
    { name: 'Twitter', icon: 'fab fa-twitter', url: 'https://twitter.com' },
    {
      name: 'Instagram',
      icon: 'fab fa-instagram',
      url: 'https://instagram.com',
    },
    {
      name: 'LinkedIn',
      icon: 'fab fa-linkedin-in',
      url: 'https://linkedin.com',
    },
  ];

  faqs = [
    {
      q: 'How do I book an event?',
      a: 'Simply browse our events, select your favorite, and click "Reserve Now" to book your ticket.',
      open: false,
    },
    {
      q: 'Can I organize my own event?',
      a: 'Yes! Contact us to get started as an event organizer.',
      open: false,
    },
    {
      q: 'Is my payment information secure?',
      a: 'Absolutely. We use industry-standard encryption and never store your payment details.',
      open: false,
    },
    {
      q: 'How do I contact support?',
      a: 'You can reach us anytime at info&#64;eventplatform.com or through our social channels.',
      open: false,
    },
  ];

  toggleFaq(index: number) {
    this.faqs[index].open = !this.faqs[index].open;
  }
}
