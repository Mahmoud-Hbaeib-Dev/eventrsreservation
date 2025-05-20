export interface Reservation {
  id: number;
  eventId: number;
  userId: number | string | null;
  eventName: string;
  eventDate: string | Date;
  numberOfGuests: number;
  numberOfTickets: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: Date;
  updatedAt: Date;
}
