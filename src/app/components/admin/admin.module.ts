import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './dashboard/dashboard.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { VenueVerificationComponent } from './venue-verification/venue-verification.component';
import { EventVerificationComponent } from './event-verification/event-verification.component';
import { ProfileComponent } from './profile/profile.component';

const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'users', component: UserManagementComponent },
  { path: 'venues', component: VenueVerificationComponent },
  { path: 'events', component: EventVerificationComponent },
  { path: 'profile', component: ProfileComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class AdminModule {}
