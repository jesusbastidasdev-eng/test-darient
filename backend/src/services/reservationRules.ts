import { AppError } from "../errors.js";

type ExistingReservation = {
  id: string;
  clientEmail: string;
  reservationDate: Date;
  startTime: string;
  endTime: string;
};

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function sameUTCDate(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

export function assertNoOverlap(
  incoming: { reservationDate: Date; startTime: string; endTime: string },
  existing: ExistingReservation[],
  ignoredReservationId?: string
): void {
  const incomingStart = toMinutes(incoming.startTime);
  const incomingEnd = toMinutes(incoming.endTime);
  if (incomingEnd <= incomingStart) {
    throw new AppError("End time must be greater than start time", 422);
  }

  const conflict = existing.find((candidate) => {
    if (ignoredReservationId && candidate.id === ignoredReservationId) return false;
    if (!sameUTCDate(candidate.reservationDate, incoming.reservationDate)) return false;
    const currentStart = toMinutes(candidate.startTime);
    const currentEnd = toMinutes(candidate.endTime);
    return incomingStart < currentEnd && incomingEnd > currentStart;
  });

  if (conflict) {
    throw new AppError("Reservation time conflicts with an existing booking", 409);
  }
}

export function assertWeeklyLimit(clientReservationCountInWeek: number): void {
  if (clientReservationCountInWeek >= 3) {
    throw new AppError("Client already reached weekly booking limit (3)", 422);
  }
}

export function weekRange(targetDate: Date): { weekStart: Date; weekEnd: Date } {
  const day = targetDate.getUTCDay();
  const shift = day === 0 ? -6 : 1 - day;
  const weekStart = new Date(Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate()));
  weekStart.setUTCDate(weekStart.getUTCDate() + shift);
  weekStart.setUTCHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
  weekEnd.setUTCHours(23, 59, 59, 999);
  return { weekStart, weekEnd };
}
