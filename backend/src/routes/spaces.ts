import { FastifyInstance } from "fastify";
import { z } from "zod";

import { AppError } from "../errors.js";

const spaceBodySchema = z.object({
  placeId: z.string().min(1),
  name: z.string().min(1),
  reference: z.string().optional(),
  capacity: z.coerce.number().int().positive(),
  description: z.string().optional()
});

export async function registerSpaceRoutes(app: FastifyInstance): Promise<void> {
  app.get("/espacios", async (_request, reply) => {
    const rows = await app.prisma.space.findMany({
      include: { place: true },
      orderBy: { createdAt: "desc" }
    });
    reply.send(rows);
  });

  app.get("/espacios/:id", async (request, reply) => {
    const params = z.object({ id: z.string().min(1) }).parse(request.params);
    const row = await app.prisma.space.findUnique({
      where: { id: params.id },
      include: { place: true, reservations: true, liveState: true }
    });
    if (!row) throw new AppError("Space not found", 404);
    reply.send(row);
  });

  app.post("/espacios", async (request, reply) => {
    const body = spaceBodySchema.parse(request.body);
    const place = await app.prisma.place.findUnique({ where: { id: body.placeId } });
    if (!place) throw new AppError("Place not found", 404);
    const created = await app.prisma.space.create({ data: body });
    reply.status(201).send(created);
  });

  app.put("/espacios/:id", async (request, reply) => {
    const params = z.object({ id: z.string().min(1) }).parse(request.params);
    const body = spaceBodySchema.parse(request.body);
    const existing = await app.prisma.space.findUnique({ where: { id: params.id } });
    if (!existing) throw new AppError("Space not found", 404);
    const updated = await app.prisma.space.update({
      where: { id: params.id },
      data: body
    });
    reply.send(updated);
  });

  app.delete("/espacios/:id", async (request, reply) => {
    const params = z.object({ id: z.string().min(1) }).parse(request.params);
    const existing = await app.prisma.space.findUnique({ where: { id: params.id } });
    if (!existing) throw new AppError("Space not found", 404);
    await app.prisma.space.delete({ where: { id: params.id } });
    reply.status(204).send();
  });
}
