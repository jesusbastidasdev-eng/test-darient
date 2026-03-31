import { FastifyInstance } from "fastify";
import { z } from "zod";

import { AppError } from "../errors.js";

const placeBodySchema = z.object({
  name: z.string().min(1),
  latitude: z.coerce.number(),
  longitude: z.coerce.number()
});

export async function registerPlaceRoutes(app: FastifyInstance): Promise<void> {
  app.get("/lugares", async (_request, reply) => {
    const rows = await app.prisma.place.findMany({ orderBy: { createdAt: "desc" } });
    reply.send(rows);
  });

  app.get("/lugares/:id", async (request, reply) => {
    const params = z.object({ id: z.string().min(1) }).parse(request.params);
    const row = await app.prisma.place.findUnique({ where: { id: params.id }, include: { spaces: true } });
    if (!row) throw new AppError("Place not found", 404);
    reply.send(row);
  });

  app.post("/lugares", async (request, reply) => {
    const body = placeBodySchema.parse(request.body);
    const created = await app.prisma.place.create({ data: body });
    reply.status(201).send(created);
  });
}
