import { FastifyInstance } from "fastify";
import { z } from "zod";

import { AppError } from "../errors.js";
import { ReservationService } from "../services/reservationService.js";

const reservationBodySchema = z.object({
  spaceId: z.string().min(1),
  placeId: z.string().optional(),
  clientEmail: z.string().email(),
  reservationDate: z.string().min(1),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/)
});

const reservationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10)
});

export async function registerReservationRoutes(app: FastifyInstance): Promise<void> {
  const reservationService = new ReservationService(app.prisma);

  app.get("/reservas", async (request, reply) => {
    const query = reservationQuerySchema.parse(request.query);
    const skip = (query.page - 1) * query.pageSize;
    const [items, total] = await Promise.all([
      app.prisma.reservation.findMany({
        include: { space: true },
        skip,
        take: query.pageSize,
        orderBy: [{ reservationDate: "asc" }, { startTime: "asc" }]
      }),
      app.prisma.reservation.count()
    ]);
    reply.send({
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.ceil(total / query.pageSize),
      items
    });
  });

  app.get("/reservas/:id", async (request, reply) => {
    const params = z.object({ id: z.string().min(1) }).parse(request.params);
    const row = await app.prisma.reservation.findUnique({
      where: { id: params.id },
      include: { space: true }
    });
    if (!row) return reply.status(404).send({ message: "Reservation not found" });
    reply.send(row);
  });

  app.post("/reservas", async (request, reply) => {
    const body = reservationBodySchema.parse(request.body);
    const created = await reservationService.createReservation(body);
    reply.status(201).send(created);
  });

  app.put("/reservas/:id", async (request, reply) => {
    const params = z.object({ id: z.string().min(1) }).parse(request.params);
    const body = reservationBodySchema.parse(request.body);
    const updated = await reservationService.updateReservation(params.id, body);
    reply.send(updated);
  });

  app.delete("/reservas/:id", async (request, reply) => {
    const params = z.object({ id: z.string().min(1) }).parse(request.params);
    const existing = await app.prisma.reservation.findUnique({ where: { id: params.id } });
    if (!existing) throw new AppError("Reservation not found", 404);
    await app.prisma.reservation.delete({ where: { id: params.id } });
    reply.status(204).send();
  });
}
