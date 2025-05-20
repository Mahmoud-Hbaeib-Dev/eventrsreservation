import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.model';
import { AuthService } from '../../../services/auth.service';
import { FivemanageImageService } from '../../../services/fivemanage-image.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  editMode = false;
  userId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private fivemanageImageService: FivemanageImageService
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      location: [''],
      bio: [''],
      avatar: [''],
    });
  }

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (user && user.id) {
      this.userId = user.id;
      this.userService.getUserById(this.userId).subscribe((userData: User) => {
        this.profileForm.patchValue(userData);
        this.profileForm.disable();
      });
    }
  }

  enableEdit() {
    this.editMode = true;
    this.profileForm.enable();
  }

  saveProfile() {
    if (this.profileForm.valid && this.userId) {
      const formValue = this.profileForm.value;
      console.log('Saving profile with avatar:', formValue.avatar);
      this.userService
        .updateUser(this.userId, formValue)
        .subscribe((updatedUser: User) => {
          this.editMode = false;
          this.profileForm.patchValue(updatedUser);
          this.profileForm.disable();
          console.log('Profile updated, new avatar:', updatedUser.avatar);
          alert('Profile saved!');
        });
    }
  }

  onAvatarChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      console.log('Uploading avatar file:', file);
      this.fivemanageImageService
        .uploadImage(file, {
          name: file.name,
          description: 'Profile avatar',
        })
        .subscribe({
          next: (url) => {
            console.log('Avatar uploaded, URL:', url);
            this.profileForm.patchValue({ avatar: url });
          },
          error: (err) => {
            alert('Image upload failed: ' + err.message);
          },
        });
    }
  }
}
