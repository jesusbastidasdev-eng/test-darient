import { PrismaClient } from "@prisma/client";

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
    realtimeSubscribers: Set<(payload: unknown) => void>;
  }
}
