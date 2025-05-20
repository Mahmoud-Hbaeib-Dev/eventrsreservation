import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VenueVerificationComponent } from './venue-verification.component';
import { CommonModule } from '@angular/common';

describe('VenueVerificationComponent', () => {
  let component: VenueVerificationComponent;
  let fixture: ComponentFixture<VenueVerificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VenueVerificationComponent, CommonModule]
    }).compileComponents();

    fixture = TestBed.createComponent(VenueVerificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
