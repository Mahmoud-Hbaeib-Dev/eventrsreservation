import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import feather from 'feather-icons';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { FivemanageImageService } from '../../../services/fivemanage-image.service';

interface User {
  id: string;
  username: string;
  email: string;
  role?: 'admin' | 'owner' | 'client';
  createdAt: Date;
  firstName?: string;
  lastName?: string;
  phone?: string;
  location?: string;
  photoURL?: string;
  avatar?: string;
  isOnline?: boolean;
}

@Component({
  selector: 'app-client-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit, AfterViewInit {
  user: User = {
    id: '',
    username: '',
    email: '',
    role: 'client',
    avatar: '',
    createdAt: new Date(),
  };
  isEditing = false;
  editedUser: Partial<User> = {};
  loading = false;
  error = '';
  success = '';
  avatarPreview: string | null = null;
  uploadingAvatar = false;

  constructor(
    public authService: AuthService,
    private userService: UserService,
    private imageService: FivemanageImageService
  ) {}

  ngOnInit() {
    this.loadUserData();
  }

  ngAfterViewInit() {
    feather.replace();
  }

  loadUserData() {
    this.loading = true;
    this.authService.currentUser$.subscribe({
      next: (user) => {
        if (user && user.id) {
          this.userService.getUserById(user.id).subscribe({
            next: (dbUser) => {
              this.user = { ...dbUser, isOnline: true };
              this.editedUser = { ...this.user };
              this.loading = false;
            },
            error: (err) => {
              this.error = 'Failed to load user data.';
              this.loading = false;
            },
          });
        } else {
          this.error = 'No user found.';
          this.loading = false;
        }
      },
      error: (error) => {
        this.error = 'Failed to load user data.';
        this.loading = false;
      },
    });
  }

  startEditing() {
    this.isEditing = true;
    this.editedUser = { ...this.user };
  }

  cancelEditing() {
    this.isEditing = false;
    this.editedUser = { ...this.user };
  }

  saveProfile() {
    if (!this.editedUser || !this.user) return;
    this.loading = true;
    this.error = '';
    this.success = '';
    this.userService.updateUser(this.user.id, this.editedUser).subscribe({
      next: (updatedUser) => {
        this.user = { ...updatedUser, isOnline: true };
        this.isEditing = false;
        this.loading = false;
        this.success = 'Profile updated successfully!';
        setTimeout(() => {
          this.success = '';
        }, 3000);
      },
      error: (err) => {
        this.error = 'Failed to update profile.';
        this.loading = false;
      },
    });
  }

  onAvatarSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.uploadingAvatar = true;
    this.imageService.uploadImage(file).subscribe({
      next: (url) => {
        this.avatarPreview = url;
        if (this.user) {
          this.userService.updateUser(this.user.id, { avatar: url }).subscribe({
            next: (updatedUser) => {
              this.user = { ...updatedUser, isOnline: true };
              this.avatarPreview = null;
              this.uploadingAvatar = false;
            },
            error: () => {
              this.uploadingAvatar = false;
            },
          });
        }
      },
      error: () => {
        this.uploadingAvatar = false;
      },
    });
  }

  getInitials(name: string): string {
    if (!name) return '';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }

  openChangePassword() {
    // Implement password change functionality
    console.log('Open password change modal');
  }

  openNotifications() {
    // Implement notifications settings
    console.log('Open notifications settings');
  }

  openPrivacy() {
    // Implement privacy settings
    console.log('Open privacy settings');
  }
}
