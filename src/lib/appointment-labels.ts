/**
 * Human-readable service list for multi-line appointments.
 */

export function formatAppointmentServiceNames(apt: {
  service: { name: string };
  lines?: Array<{ sortOrder: number; service: { name: string } }>;
}): string {
  if (apt.lines && apt.lines.length > 0) {
    return [...apt.lines]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((l) => l.service.name)
      .join(" + ");
  }
  return apt.service.name;
}
