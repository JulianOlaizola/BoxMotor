export type UserRole = 'CLIENT' | 'MECHANIC' | 'RECEPTIONIST' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  active: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
}

export interface Vehicle {
  id: string;
  customerId: string;
  brand: string;
  model: string;
  version?: string;
  year: number;
  plateNorm: string;
  plateRaw: string;
  mileage: number;
  fuel?: string;
  transmission?: string;
  vin?: string;
  observations?: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  durationMin: number;
  laborPrice: number;
  active: boolean;
}

export interface Appointment {
  id: string;
  customerId: string;
  vehicleId: string;
  serviceId: string;
  mechanicId?: string;
  bayId?: string;
  startsAt: string;
  endsAt: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'NO_SHOW' | 'CONVERTED_TO_WORK_ORDER';
  reason?: string;
  problemDescription?: string;
}
