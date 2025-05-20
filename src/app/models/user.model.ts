export interface User {
  id: string;
  username: string;
  password: string;
  email: string;
  role?: 'admin' | 'owner' | 'client';
  firstName?: string;
  lastName?: string;
  phone?: string;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
  status?: string;
  gender?: 'male' | 'female' | 'other';
  location?: string;
  bio?: string;
  avatar?: string;
}
