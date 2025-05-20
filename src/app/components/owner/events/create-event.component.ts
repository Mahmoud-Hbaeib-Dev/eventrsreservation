import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FivemanageImageService } from '../../../services/fivemanage-image.service';
import { CategoryService } from '../../../services/category.service';
import { VenueService } from '../../../services/venue.service';
import { Category } from '../../../models/category.model';
import { Venue } from '../../../models/venue.model';
import { AuthService } from '../../../services/auth.service';
import { EventService } from '../../../services/event.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-event',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-event.component.html',
  styleUrls: ['./create-event.component.scss'],
})
export class CreateEventComponent implements OnInit {
  eventForm: FormGroup;
  uploadingImage = false;
  uploadError = '';
  imagePreview: string | null = null;
  categories: Category[] = [];
  ownerVenue: Venue | null = null;
  loadingCategories = false;
  loadingVenue = false;
  categoryError = '';
  venueError = '';
  submitError = '';

  constructor(
    private fb: FormBuilder,
    private imageService: FivemanageImageService,
    private categoryService: CategoryService,
    private venueService: VenueService,
    private authService: AuthService,
    private eventService: EventService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.eventForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      date: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      capacity: ['', [Validators.required, Validators.min(1)]],
      categoryId: ['', Validators.required],
      venueId: ['', Validators.required],
      image: [''],
    });
  }

  ngOnInit() {
    this.loadCategories();
    this.loadOwnerVenue();
  }

  loadCategories() {
    this.loadingCategories = true;
    this.categoryError = '';
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.loadingCategories = false;
      },
      error: (error) => {
        this.categoryError = 'Failed to load categories. Please try again.';
        this.loadingCategories = false;
        console.error('Error loading categories:', error);
      },
    });
  }

  loadOwnerVenue() {
    this.loadingVenue = true;
    this.venueError = '';
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.venueError = 'You must be logged in to create an event.';
      this.loadingVenue = false;
      return;
    }

    this.venueService.getVenuesByOwner(currentUser.id).subscribe({
      next: (venues) => {
        if (venues.length > 0) {
          this.ownerVenue = venues[0]; // Get the first (and only) venue
          this.eventForm.patchValue({ venueId: this.ownerVenue.id });
        } else {
          this.venueError =
            'You need to create a venue first before creating events.';
        }
        this.loadingVenue = false;
      },
      error: (error) => {
        this.venueError = 'Failed to load venue. Please try again.';
        this.loadingVenue = false;
        console.error('Error loading venue:', error);
      },
    });
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.uploadingImage = true;
    this.uploadError = '';
    this.imageService.uploadImage(file).subscribe({
      next: (url: string) => {
        this.eventForm.patchValue({ image: url });
        this.imagePreview = url;
        this.uploadingImage = false;
      },
      error: (err) => {
        this.uploadError = err.message || 'Image upload failed.';
        this.uploadingImage = false;
      },
    });
  }

  submitEvent() {
    if (this.eventForm.invalid || !this.ownerVenue) return;

    const eventData = {
      ...this.eventForm.value,
      availableSpots: this.eventForm.value.capacity,
      isVerified: false,
      status: 'pending',
      rejectionComment: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.eventService.createEvent(eventData).subscribe({
      next: (res) => {
        this.snackBar.open('Event created successfully!', 'Close', {
          duration: 2000,
          panelClass: 'snackbar-success',
        });
        setTimeout(() => {
          this.router.navigate(['/owner/events/manage']);
        }, 2000);
      },
      error: (err) => {
        this.snackBar.open(
          'Failed to create event. Please try again.',
          'Close',
          { duration: 3000, panelClass: 'snackbar-error' }
        );
        console.error(err);
      },
    });
  }
}
