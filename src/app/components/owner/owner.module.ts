import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./profile/profile.component').then((m) => m.ProfileComponent),
  },
  {
    path: 'events/create',
    loadComponent: () =>
      import('./events/create-event.component').then(
        (m) => m.CreateEventComponent
      ),
  },
  {
    path: 'events/manage',
    loadComponent: () =>
      import('./events/manage-events.component').then(
        (m) => m.ManageEventsComponent
      ),
  },
  {
    path: 'reservations',
    loadComponent: () =>
      import('./reservations/manage-reservations.component').then(
        (m) => m.ManageReservationsComponent
      ),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class OwnerModule {}
