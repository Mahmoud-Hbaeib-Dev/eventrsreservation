export interface Event {
  id: number;
  venueId: number;
  title: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  price: number;
  capacity: number;
  availableSpots: number;
  categoryId: string;
  category?: string;
  image?: string;
  isVerified: boolean;
  status?: 'pending' | 'accepted' | 'rejected';
  rejectionComment?: string;
  createdAt: Date;
  updatedAt: Date;
}
