export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // minutes
  price: number;
  category: string;
  comingSoon?: boolean;
}

export interface Appointment {
  id: string;
  serviceId: string;
  serviceName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  customerName: string;
  customerPhone: string;
  notes?: string;
  status: "confirmed" | "pending" | "cancelled";
  createdAt: string;
}

export interface BlockedSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  reason?: string;
}

export interface Testimonial {
  id: string;
  text: string;
  rating: number;
}
