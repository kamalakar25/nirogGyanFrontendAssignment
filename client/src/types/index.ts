export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  image: string;
  rating: number;
  experience: number;
  availabilityStatus: 'available' | 'busy' | 'unavailable';
  consultationFee: number;
  location: string;
  about: string;
  education: string[];
  languages: string[];
  availableSlots: TimeSlot[];
}

export interface TimeSlot {
  date: string;
  slots: string[];
}

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  patientName: string;
  patientEmail: string;
  date: string;
  time: string;
  consultationFee: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  createdAt: string;
}

export interface BookingFormData {
  doctorId: string;
  patientName: string;
  patientEmail: string;
  date: string;
  time: string;
}

export interface AnalyticsData {
  totalAppointments: number;
  totalDoctors: number;
  totalPatients: number;
  monthlyRevenue: number;
  availableDoctors: number;
  recentAppointments: Appointment[];
  specialityStats: Record<string, number>;
  monthlyStats: Array<{
    date: string;
    appointments: number;
    revenue: number;
  }>;
  lastUpdated: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  count?: number;
}