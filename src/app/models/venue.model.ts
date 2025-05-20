export interface Venue {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  type: string;
  address: string;
  city: string;
  capacity: number;
  pricePerHour: number;
  images: string[];
  amenities: string[];
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}
