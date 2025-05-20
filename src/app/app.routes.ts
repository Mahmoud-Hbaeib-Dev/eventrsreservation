import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { OwnerGuard } from './guards/owner.guard';
import { ClientGuard } from './guards/client.guard';
import { EventsComponent } from './pages/events/events.component';
import { HomeComponent } from './pages/home/home.component';
import { MyReservationsComponent } from './pages/my-reservations/my-reservations.component';
import { AboutComponent } from './pages/about/about.component';
import { PaymentComponent } from './pages/payment/payment.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'events', component: EventsComponent },
  { path: 'about', component: AboutComponent },
  {
    path: 'my-reservations',
    component: MyReservationsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'payment',
    component: PaymentComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./components/auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: 'admin',
    canActivate: [AuthGuard, AdminGuard],
    loadChildren: () =>
      import('./components/admin/admin.module').then((m) => m.AdminModule),
  },
  {
    path: 'owner',
    canActivate: [AuthGuard, OwnerGuard],
    loadChildren: () =>
      import('./components/owner/owner.module').then((m) => m.OwnerModule),
  },
  {
    path: 'client',
    canActivate: [AuthGuard, ClientGuard],
    loadChildren: () =>
      import('./components/client/client.module').then((m) => m.ClientModule),
  },
  { path: '**', redirectTo: '' },
];
