import { PrismaClient } from "@prisma/client";
import { beforeEach, describe, expect, it } from "vitest";

import { createApp } from "../../app.js";

type ReservationRow = {
  id: string;
  spaceId: string;
  placeId?: string;
  clientEmail: string;
  reservationDate: Date;
  startTime: string;
  endTime: string;
};

function makePrismaMock() {
  const places = [{ id: "p1", name: "HQ", latitude: 8.99, longitude: -79.52 }];
  const spaces = [{ id: "s1", placeId: "p1", name: "Sala A", capacity: 6 }];
  const reservations: ReservationRow[] = [];

  return {
    place: {
      findUnique: async ({ where }: { where: { id: string } }) =>
        places.find((row) => row.id === where.id) ?? null
    },
    space: {
      findUnique: async ({ where }: { where: { id: string } }) =>
        spaces.find((row) => row.id === where.id) ?? null,
      findMany: async () => spaces,
      create: async ({ data }: { data: Record<string, unknown> }) => ({ id: "s2", ...data }),
      update: async ({ data }: { data: Record<string, unknown> }) => ({ id: "s1", ...data }),
      delete: async () => ({})
    },
    reservation: {
      findMany: async ({ where }: { where?: Record<string, unknown> } = {}) => {
        if (!where) return reservations;
        return reservations.filter((row) => {
          if (where.spaceId && row.spaceId !== where.spaceId) return false;
          if (where.reservationDate && row.reservationDate.getTime() !== (where.reservationDate as Date).getTime()) {
            return false;
          }
          return true;
        });
      },
      findUnique: async ({ where }: { where: { id: string } }) =>
        reservations.find((row) => row.id === where.id) ?? null,
      create: async ({ data }: { data: Record<string, unknown> }) => {
        const row = {
          id: `r${reservations.length + 1}`,
          ...data
        } as ReservationRow;
        reservations.push(row);
        return row;
      },
      update: async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
        const idx = reservations.findIndex((row) => row.id === where.id);
        reservations[idx] = { ...reservations[idx], ...data };
        return reservations[idx];
      },
      delete: async ({ where }: { where: { id: string } }) => {
        const idx = reservations.findIndex((row) => row.id === where.id);
        if (idx >= 0) reservations.splice(idx, 1);
        return {};
      },
      count: async ({ where }: { where?: Record<string, unknown> } = {}) => {
        if (!where || !where.clientEmail) return reservations.length;
        return reservations.filter((row) => row.clientEmail === where.clientEmail).length;
      }
    },
    spaceLiveState: {
      findMany: async () => [],
      count: async () => 0
    }
  } as unknown as PrismaClient;
}

describe("reservations routes", () => {
  let app: Awaited<ReturnType<typeof createApp>>;
  beforeEach(async () => {
    process.env.API_KEY = "test-key";
    process.env.DATABASE_URL = "postgres://unused";
    app = await createApp({ prisma: makePrismaMock() });
  });

  it("returns 401 when missing API key", async () => {
    const res = await app.inject({ method: "GET", url: "/reservas" });
    expect(res.statusCode).toBe(401);
  });

  it("creates and lists reservations", async () => {
    const create = await app.inject({
      method: "POST",
      url: "/reservas",
      headers: { "x-api-key": "test-key" },
      payload: {
        spaceId: "s1",
        clientEmail: "hello@example.com",
        reservationDate: "2026-03-31",
        startTime: "10:00",
        endTime: "11:00"
      }
    });
    expect(create.statusCode).toBe(201);

    const list = await app.inject({
      method: "GET",
      url: "/reservas?page=1&pageSize=10",
      headers: { "x-api-key": "test-key" }
    });
    expect(list.statusCode).toBe(200);
    const payload = list.json() as { total: number; items: unknown[] };
    expect(payload.total).toBe(1);
    expect(payload.items.length).toBe(1);
  });
});
