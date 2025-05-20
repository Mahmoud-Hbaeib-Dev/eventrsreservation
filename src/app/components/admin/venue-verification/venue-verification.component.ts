import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VenueService } from '../../../services/venue.service';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.model';

interface Venue {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  address?: string;
  city?: string;
  location?: string;
  isVerified: boolean;
  rejected?: boolean;
  // Add other fields as needed
}

@Component({
  selector: 'app-venue-verification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './venue-verification.component.html',
  styleUrls: ['./venue-verification.component.scss'],
  providers: [VenueService, UserService],
})
export class VenueVerificationComponent implements OnInit {
  venues: (Venue & { ownerName?: string })[] = [];
  users: User[] = [];

  constructor(
    private venueService: VenueService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.loadVenuesWithOwners();
  }

  loadVenuesWithOwners() {
    this.userService.getAllUsers().subscribe((users) => {
      this.users = users;
      this.venueService.getAllVenues().subscribe((venues: Venue[]) => {
        this.venues = venues.map((venue) => ({
          ...venue,
          ownerName: this.getOwnerName(venue.ownerId),
        }));
      });
    });
  }

  getOwnerName(ownerId: string): string {
    const user = this.users.find((u) => u.id == ownerId);
    return user ? user.username : '-';
  }

  approveVenue(id: string) {
    this.venueService.approveVenue(id).subscribe(() => {
      this.loadVenuesWithOwners();
    });
  }

  rejectVenue(id: string) {
    this.venueService.rejectVenue(id).subscribe(() => {
      this.loadVenuesWithOwners();
    });
  }

  deleteVenue(id: string) {
    this.venueService.deleteVenue(id).subscribe(() => {
      this.loadVenuesWithOwners();
    });
  }
}
