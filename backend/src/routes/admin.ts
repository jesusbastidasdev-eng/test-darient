import { FastifyInstance } from "fastify";
import { z } from "zod";

const telemetryQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
  placeId: z.string().optional()
});

export async function registerAdminRoutes(app: FastifyInstance): Promise<void> {
  app.get("/admin/telemetria", async (request, reply) => {
    const query = telemetryQuerySchema.parse(request.query);
    const skip = (query.page - 1) * query.pageSize;
    const where = query.placeId ? { placeId: query.placeId } : {};
    const [items, total] = await Promise.all([
      app.prisma.spaceLiveState.findMany({
        where,
        include: { space: true },
        skip,
        take: query.pageSize,
        orderBy: { observedAt: "desc" }
      }),
      app.prisma.spaceLiveState.count({ where })
    ]);

    reply.send({
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.ceil(total / query.pageSize),
      items
    });
  });

  app.get("/admin/telemetria/stream", async (_request, reply) => {
    reply.hijack();
    reply.raw.setHeader("Content-Type", "text/event-stream");
    reply.raw.setHeader("Cache-Control", "no-cache");
    reply.raw.setHeader("Connection", "keep-alive");
    reply.raw.write(": connected\n\n");

    const subscriber = (payload: unknown) => {
      reply.raw.write(`data: ${JSON.stringify(payload)}\n\n`);
    };

    app.realtimeSubscribers.add(subscriber);
    reply.raw.on("close", () => {
      app.realtimeSubscribers.delete(subscriber);
    });
  });
}
