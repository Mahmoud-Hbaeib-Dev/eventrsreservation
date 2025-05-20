import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { take } from 'rxjs/operators';

export interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private counter = 0;
  private notifications = new BehaviorSubject<Notification[]>([]);

  constructor() {}

  getNotifications(): Observable<Notification[]> {
    return this.notifications.asObservable();
  }

  success(message: string, duration = 4000): void {
    this.addNotification({
      message,
      type: 'success',
      duration,
    });
  }

  error(message: string, duration = 5000): void {
    this.addNotification({
      message,
      type: 'error',
      duration,
    });
  }

  info(message: string, duration = 3000): void {
    this.addNotification({
      message,
      type: 'info',
      duration,
    });
  }

  warning(message: string, duration = 4000): void {
    this.addNotification({
      message,
      type: 'warning',
      duration,
    });
  }

  private addNotification(notification: Omit<Notification, 'id'>): void {
    const id = this.counter++;
    const newNotification = { id, ...notification };
    const currentNotifications = this.notifications.getValue();
    this.notifications.next([...currentNotifications, newNotification]);

    // Auto remove after duration
    if (notification.duration) {
      timer(notification.duration)
        .pipe(take(1))
        .subscribe(() => this.remove(id));
    }
  }

  remove(id: number): void {
    const currentNotifications = this.notifications.getValue();
    this.notifications.next(
      currentNotifications.filter((notification) => notification.id !== id)
    );
  }

  clear(): void {
    this.notifications.next([]);
  }
}
