import { PrismaClient, Reservation } from "@prisma/client";

import { AppError } from "../errors.js";
import { ReservationInput } from "../types.js";
import { assertNoOverlap, assertWeeklyLimit, weekRange } from "./reservationRules.js";

export class ReservationService {
  constructor(private readonly prisma: PrismaClient) {}

  async createReservation(input: ReservationInput): Promise<Reservation> {
    const space = await this.prisma.space.findUnique({ where: { id: input.spaceId } });
    if (!space) {
      throw new AppError("Space not found", 404);
    }

    const reservationDate = new Date(input.reservationDate);
    if (Number.isNaN(reservationDate.getTime())) {
      throw new AppError("Invalid reservation date", 422);
    }

    const sameSpaceReservations = await this.prisma.reservation.findMany({
      where: { spaceId: input.spaceId, reservationDate }
    });
    assertNoOverlap(
      { reservationDate, startTime: input.startTime, endTime: input.endTime },
      sameSpaceReservations
    );

    const { weekStart, weekEnd } = weekRange(reservationDate);
    const weeklyCount = await this.prisma.reservation.count({
      where: {
        clientEmail: input.clientEmail,
        reservationDate: { gte: weekStart, lte: weekEnd }
      }
    });
    assertWeeklyLimit(weeklyCount);

    return this.prisma.reservation.create({
      data: {
        spaceId: input.spaceId,
        placeId: input.placeId ?? space.placeId,
        clientEmail: input.clientEmail.toLowerCase(),
        reservationDate,
        startTime: input.startTime,
        endTime: input.endTime
      }
    });
  }

  async updateReservation(id: string, input: ReservationInput): Promise<Reservation> {
    const existing = await this.prisma.reservation.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError("Reservation not found", 404);
    }
    const reservationDate = new Date(input.reservationDate);
    if (Number.isNaN(reservationDate.getTime())) {
      throw new AppError("Invalid reservation date", 422);
    }

    const sameSpaceReservations = await this.prisma.reservation.findMany({
      where: { spaceId: input.spaceId, reservationDate }
    });
    assertNoOverlap(
      { reservationDate, startTime: input.startTime, endTime: input.endTime },
      sameSpaceReservations,
      id
    );

    const { weekStart, weekEnd } = weekRange(reservationDate);
    const weeklyCount = await this.prisma.reservation.count({
      where: {
        clientEmail: input.clientEmail,
        reservationDate: { gte: weekStart, lte: weekEnd },
        NOT: { id }
      }
    });
    assertWeeklyLimit(weeklyCount);

    return this.prisma.reservation.update({
      where: { id },
      data: {
        spaceId: input.spaceId,
        placeId: input.placeId,
        clientEmail: input.clientEmail.toLowerCase(),
        reservationDate,
        startTime: input.startTime,
        endTime: input.endTime
      }
    });
  }
}
