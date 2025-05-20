import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { VenueService } from '../../../services/venue.service';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FivemanageImageService } from '../../../services/fivemanage-image.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-owner-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  venueForm: FormGroup;
  venue: any;
  owner: any;
  editMode = false;
  loading = true;
  error = '';
  imagesPreview: string[] = [];
  uploadingImage = false;
  uploadError = '';
  creatingVenue = false;
  ownerForm: FormGroup;
  editOwnerMode = false;

  constructor(
    private fb: FormBuilder,
    private venueService: VenueService,
    private authService: AuthService,
    private imageService: FivemanageImageService,
    private userService: UserService
  ) {
    this.venueForm = this.fb.group({
      name: [''],
      type: [''],
      address: [''],
      city: [''],
      description: [''],
      amenities: [''],
      images: [''],
      capacity: [''],
      pricePerHour: [''],
    });
    this.ownerForm = this.fb.group({
      firstName: [''],
      lastName: [''],
      email: [''],
      phone: [''],
      location: [''],
      bio: [''],
      avatar: [''],
      gender: [''],
    });
  }

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;
    this.userService.getUserById(currentUser.id).subscribe({
      next: (user) => {
        this.owner = user;
        this.ownerForm.patchValue({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phone: user.phone || '',
          location: user.location || '',
          bio: user.bio || '',
          avatar: user.avatar || '',
          gender: user.gender || '',
        });
        this.authService.setCurrentUser(user);
      },
      error: () => {
        this.error = 'Failed to load user info.';
      },
    });
    this.venueService.getAllVenues().subscribe({
      next: (venues: any[]) => {
        this.venue = venues.find(
          (v) => v.ownerId == currentUser.id || v.ownerId == +currentUser.id
        );
        if (this.venue) {
          this.imagesPreview = this.venue.images || [];
          this.venueForm.patchValue({
            name: this.venue.name,
            type: this.venue.type,
            address: this.venue.address,
            city: this.venue.city,
            description: this.venue.description,
            amenities: (this.venue.amenities || []).join(', '),
            images: (this.venue.images || []).join(', '),
            capacity: this.venue.capacity,
            pricePerHour: this.venue.pricePerHour,
          });
          this.editMode = false;
          this.creatingVenue = false;
        } else {
          // No venue: show form in create mode
          this.editMode = true;
          this.creatingVenue = true;
          this.imagesPreview = [];
          this.venueForm.reset();
        }
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load venue.';
        this.loading = false;
      },
    });
  }

  toggleEdit() {
    this.editMode = !this.editMode;
    if (this.editMode && this.venue) {
      this.venueForm.patchValue({
        name: this.venue.name,
        type: this.venue.type,
        address: this.venue.address,
        city: this.venue.city,
        description: this.venue.description,
        amenities: (this.venue.amenities || []).join(', '),
        images: (this.venue.images || []).join(', '),
        capacity: this.venue.capacity,
        pricePerHour: this.venue.pricePerHour,
      });
    }
  }

  cancelEdit() {
    this.editMode = false;
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.uploadingImage = true;
    this.uploadError = '';
    this.imageService.uploadImage(file).subscribe({
      next: (url: string) => {
        this.imagesPreview.push(url);
        this.venueForm.patchValue({
          images: this.imagesPreview.join(', '),
        });
        this.uploadingImage = false;
      },
      error: (err) => {
        this.uploadError = err.message || 'Image upload failed.';
        this.uploadingImage = false;
      },
    });
  }

  saveVenue() {
    if (this.creatingVenue) {
      // POST: create new venue for this owner
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        alert('User not found. Please login again.');
        return;
      }

      const newVenue = {
        ...this.venueForm.value,
        ownerId: String(currentUser.id), // Always set ownerId to current user's id as string
        amenities: (this.venueForm.value.amenities || '')
          .split(',')
          .map((a: string) => a.trim())
          .filter((a: string) => a), // Remove empty strings
        images: this.imagesPreview,
        capacity: +this.venueForm.value.capacity, // Convert to number
        pricePerHour: +this.venueForm.value.pricePerHour, // Convert to number
        isVerified: false, // New venues start unverified
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log('Creating new venue:', newVenue);
      this.venueService.createVenue(newVenue).subscribe({
        next: (venue) => {
          this.venue = venue;
          this.imagesPreview = venue.images || [];
          this.editMode = false;
          this.creatingVenue = false;
          alert('Venue created successfully!');
        },
        error: (error) => {
          console.error('Error creating venue:', error);
          alert('Failed to create venue. Please try again.');
        },
      });
      return;
    }

    if (!this.venue) {
      alert('No venue found to update.');
      return;
    }

    const updated = {
      ...this.venue,
      ...this.venueForm.value,
      amenities: (this.venueForm.value.amenities || '')
        .split(',')
        .map((a: string) => a.trim())
        .filter((a: string) => a), // Remove empty strings
      images: this.imagesPreview,
      capacity: +this.venueForm.value.capacity, // Convert to number
      pricePerHour: +this.venueForm.value.pricePerHour, // Convert to number
      updatedAt: new Date().toISOString(),
    };

    console.log('Updating venue:', updated);
    this.venueService.updateVenue(this.venue.id, updated).subscribe({
      next: (venue) => {
        this.venue = venue;
        this.imagesPreview = venue.images || [];
        this.editMode = false;
        alert('Venue updated successfully!');
      },
      error: (error) => {
        console.error('Error updating venue:', error);
        alert('Failed to update venue. Please try again.');
      },
    });
  }

  toggleEditOwner() {
    this.editOwnerMode = !this.editOwnerMode;
    if (this.editOwnerMode) {
      this.ownerForm.patchValue({
        firstName: this.owner.firstName || '',
        lastName: this.owner.lastName || '',
        email: this.owner.email || '',
        phone: this.owner.phone || '',
        location: this.owner?.location || '',
        bio: this.owner?.bio || '',
        avatar: this.owner?.avatar || '',
        gender: this.owner.gender || '',
      });
    }
  }

  cancelEditOwner() {
    this.editOwnerMode = false;
    this.ownerForm.patchValue({
      firstName: this.owner.firstName || '',
      lastName: this.owner.lastName || '',
      email: this.owner.email || '',
      phone: this.owner.phone || '',
      location: this.owner?.location || '',
      bio: this.owner?.bio || '',
      avatar: this.owner?.avatar || '',
      gender: this.owner.gender || '',
    });
  }

  saveOwner() {
    if (!this.owner || !this.owner.id) return;
    const updated = { ...this.owner, ...this.ownerForm.value };
    this.userService.updateUser(this.owner.id, updated).subscribe({
      next: (user) => {
        this.owner = user;
        this.editOwnerMode = false;
        this.ownerForm.patchValue(user);
        this.authService.setCurrentUser(user);
        alert('Profile updated!');
      },
      error: (err) => {
        alert('Failed to update profile.');
      },
    });
  }

  onOwnerAvatarSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.uploadingImage = true;
    this.uploadError = '';
    this.imageService.uploadImage(file).subscribe({
      next: (url: string) => {
        this.ownerForm.patchValue({ avatar: url });
        this.uploadingImage = false;
      },
      error: (err) => {
        this.uploadError = err.message || 'Image upload failed.';
        this.uploadingImage = false;
      },
    });
  }
}
