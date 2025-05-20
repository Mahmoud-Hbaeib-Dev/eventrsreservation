import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NotificationService,
  Notification,
} from '../../../services/notification.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notifications-container">
      <div
        *ngFor="let notification of notifications"
        class="notification-toast"
        [ngClass]="notification.type"
        [@fadeInOut]
      >
        <div class="notification-content">
          <div class="notification-icon-wrapper">
            <i
              class="notification-icon"
              [ngClass]="getIconClass(notification)"
            ></i>
          </div>
          <div class="notification-message">{{ notification.message }}</div>
        </div>
        <button
          class="notification-close"
          (click)="removeNotification(notification.id)"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .notifications-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 12px;
        max-width: 400px;
        font-family: 'Poppins', sans-serif;
      }

      .notification-toast {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        padding: 16px;
        border-radius: 10px;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        background-color: white;
        min-width: 320px;
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(0, 0, 0, 0.05);
      }

      .notification-content {
        display: flex;
        align-items: flex-start;
        gap: 14px;
        flex: 1;
      }

      .notification-icon-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .notification-icon {
        color: white;
      }

      .notification-message {
        font-size: 14px;
        color: #333;
        line-height: 1.5;
        margin-top: 4px;
      }

      .notification-close {
        background: none;
        border: none;
        color: #888;
        cursor: pointer;
        padding: 0;
        margin-left: 12px;
        font-size: 14px;
        opacity: 0.7;
        transition: all 0.2s;
      }

      .notification-close:hover {
        color: #333;
        opacity: 1;
      }

      .success {
        background: linear-gradient(
          to right,
          rgba(76, 175, 80, 0.05),
          rgba(76, 175, 80, 0.01)
        );
        border-left: 4px solid #4caf50;
      }

      .success .notification-icon-wrapper {
        background: linear-gradient(45deg, #4caf50, #2e7d32);
        color: white;
      }

      .success .notification-icon {
        color: white;
      }

      .error {
        background: linear-gradient(
          to right,
          rgba(244, 67, 54, 0.05),
          rgba(244, 67, 54, 0.01)
        );
        border-left: 4px solid #f44336;
      }

      .error .notification-icon-wrapper {
        background: linear-gradient(45deg, #f44336, #d32f2f);
        color: white;
      }

      .error .notification-icon {
        color: white;
      }

      .warning {
        background: linear-gradient(
          to right,
          rgba(255, 152, 0, 0.05),
          rgba(255, 152, 0, 0.01)
        );
        border-left: 4px solid #ff9800;
      }

      .warning .notification-icon-wrapper {
        background: linear-gradient(45deg, #ff9800, #f57c00);
        color: white;
      }

      .warning .notification-icon {
        color: white;
      }

      .info {
        background: linear-gradient(
          to right,
          rgba(123, 44, 191, 0.05),
          rgba(83, 144, 217, 0.01)
        );
        border-left: 4px solid #7b2cbf;
      }

      .info .notification-icon-wrapper {
        background: linear-gradient(45deg, #7b2cbf, #5390d9);
        color: white;
      }

      .info .notification-icon {
        color: white;
      }

      .success .notification-icon,
      .error .notification-icon,
      .warning .notification-icon,
      .info .notification-icon {
        color: white;
      }
    `,
  ],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate(
          '400ms cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
      transition(':leave', [
        animate(
          '300ms cubic-bezier(0.6, -0.28, 0.735, 0.045)',
          style({ opacity: 0, transform: 'translateY(-20px)' })
        ),
      ]),
    ]),
  ],
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService.getNotifications().subscribe((notifications) => {
      this.notifications = notifications;
    });
  }

  removeNotification(id: number): void {
    this.notificationService.remove(id);
  }

  getIconClass(notification: Notification): string {
    switch (notification.type) {
      case 'success':
        return 'fas fa-check-circle';
      case 'error':
        return 'fas fa-exclamation-circle';
      case 'warning':
        return 'fas fa-exclamation-triangle';
      case 'info':
        return 'fas fa-info-circle';
      default:
        return 'fas fa-bell';
    }
  }
}
