import type { Appointment, BlockedSlot } from "@/types";

let appointments: Appointment[] = [
  {
    id: "apt-1",
    serviceId: "haircut",
    serviceName: "قص شعر",
    date: "2025-03-15",
    time: "10:00",
    customerName: "مريم أحمد",
    customerPhone: "+966 50 123 4567",
    notes: "عميلة جديدة",
    status: "confirmed",
    createdAt: "2025-03-09T10:00:00Z",
  },
  {
    id: "apt-2",
    serviceId: "hair-color",
    serviceName: "صبغة",
    date: "2025-03-16",
    time: "14:00",
    customerName: "لينا محمد",
    customerPhone: "+966 55 987 6543",
    status: "confirmed",
    createdAt: "2025-03-08T14:30:00Z",
  },
  {
    id: "apt-3",
    serviceId: "occasion-hairstyles",
    serviceName: "تسريحات للمناسبات",
    date: "2025-03-12",
    time: "11:00",
    customerName: "رنا خالد",
    customerPhone: "+966 54 111 2233",
    notes: "حفل زفاف",
    status: "pending",
    createdAt: "2025-03-09T09:00:00Z",
  },
];

let blockedSlots: BlockedSlot[] = [
  {
    id: "block-1",
    date: "2025-03-10",
    startTime: "12:00",
    endTime: "14:00",
    reason: "اجتماع فريق العمل",
  },
];

let nextAppointmentId = 4;
let nextBlockId = 2;

export function getAppointments(): Appointment[] {
  return [...appointments];
}

export function getAppointmentById(id: string): Appointment | undefined {
  return appointments.find((a) => a.id === id);
}

export function addAppointment(appointment: Omit<Appointment, "id" | "createdAt">): Appointment {
  const newAppointment: Appointment = {
    ...appointment,
    id: `apt-${nextAppointmentId++}`,
    createdAt: new Date().toISOString(),
  };
  appointments.push(newAppointment);
  return newAppointment;
}

export function updateAppointment(id: string, updates: Partial<Appointment>): Appointment | null {
  const index = appointments.findIndex((a) => a.id === id);
  if (index === -1) return null;
  appointments[index] = { ...appointments[index], ...updates };
  return appointments[index];
}

export function deleteAppointment(id: string): boolean {
  const index = appointments.findIndex((a) => a.id === id);
  if (index === -1) return false;
  appointments.splice(index, 1);
  return true;
}

export function getBlockedSlots(): BlockedSlot[] {
  return [...blockedSlots];
}

export function addBlockedSlot(slot: Omit<BlockedSlot, "id">): BlockedSlot {
  const newSlot: BlockedSlot = {
    ...slot,
    id: `block-${nextBlockId++}`,
  };
  blockedSlots.push(newSlot);
  return newSlot;
}

export function deleteBlockedSlot(id: string): boolean {
  const index = blockedSlots.findIndex((b) => b.id === id);
  if (index === -1) return false;
  blockedSlots.splice(index, 1);
  return true;
}
