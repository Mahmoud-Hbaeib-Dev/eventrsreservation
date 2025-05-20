import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Guards
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { OwnerGuard } from './guards/owner.guard';
import { ClientGuard } from './guards/client.guard';

const routes: Routes = [
  { path: '', redirectTo: '/events', pathMatch: 'full' },
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
  { path: '**', redirectTo: '/events' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
