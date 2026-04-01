import cors from "@fastify/cors";
import Fastify, { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";
import { ZodError } from "zod";

import { apiKeyGuard } from "./middleware/apiKey.js";
import { registerSpaceRoutes } from "./routes/spaces.js";
import { registerReservationRoutes } from "./routes/reservations.js";
import { registerAdminRoutes } from "./routes/admin.js";
import { AppError } from "./errors.js";
import { registerPlaceRoutes } from "./routes/places.js";

export type AppOptions = {
  prisma: PrismaClient;
};

export async function createApp(options: AppOptions): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });
  await app.register(cors, {
    origin: true,
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
  });

  app.decorate("prisma", options.prisma);
  app.decorate("realtimeSubscribers", new Set<(payload: unknown) => void>());

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof AppError) {
      reply.status(error.statusCode).send({ message: error.message });
      return;
    }
    if (error instanceof ZodError) {
      reply.status(422).send({ message: "Validation error", details: error.issues });
      return;
    }
    if (typeof error === "object" && error !== null && "statusCode" in error) {
      const statusCode =
        typeof error.statusCode === "number" && error.statusCode >= 400 ? error.statusCode : 500;
      const message = "message" in error && typeof error.message === "string"
        ? error.message
        : "Internal server error";
      reply.status(statusCode).send({ message });
      return;
    }
    app.log.error(error);
    reply.status(500).send({ message: "Internal server error" });
  });

  app.get("/health", async () => ({ status: "ok" }));

  app.addHook("preHandler", apiKeyGuard);

  await registerPlaceRoutes(app);
  await registerSpaceRoutes(app);
  await registerReservationRoutes(app);
  await registerAdminRoutes(app);

  return app;
}
