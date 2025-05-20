import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventVerificationComponent } from './event-verification.component';
import { CommonModule } from '@angular/common';

describe('EventVerificationComponent', () => {
  let component: EventVerificationComponent;
  let fixture: ComponentFixture<EventVerificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventVerificationComponent, CommonModule],
    }).compileComponents();

    fixture = TestBed.createComponent(EventVerificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
