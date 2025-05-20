import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { User } from '../../../models/user.model';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss'],
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  selectedRole: string = '';
  showEditModal = false;
  editingUser: User | null = null;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe((users: any[]) => {
      this.users = users;
      this.filterUsers();
    });
  }

  filterUsers(): void {
      this.filteredUsers = this.users.filter(
      (user) => !this.selectedRole || user.role === this.selectedRole
      );
  }

  editUser(user: User): void {
    this.editingUser = { ...user };
    this.showEditModal = true;
  }

  updateUser(): void {
    if (this.editingUser) {
      this.userService
        .updateUser(this.editingUser.id, this.editingUser)
        .subscribe({
          next: () => {
            this.loadUsers();
            this.closeModal();
          },
          error: (error) => {
            console.error('Error updating user:', error);
          },
        });
    }
  }

  acceptUser(userId: string): void {
    this.userService.acceptUser(userId).subscribe(() => this.loadUsers());
  }

  refuseUser(userId: string): void {
    this.userService.refuseUser(userId).subscribe(() => this.loadUsers());
  }

  deleteUser(userId: string): void {
    this.userService.deleteUser(userId).subscribe(() => this.loadUsers());
  }

  closeModal(): void {
    this.showEditModal = false;
    this.editingUser = null;
  }
}
