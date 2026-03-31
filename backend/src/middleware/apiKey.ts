import { FastifyReply, FastifyRequest } from "fastify";

import { env } from "../config/env.js";

export async function apiKeyGuard(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const incomingKey = request.headers["x-api-key"];
  const queryKey =
    typeof request.query === "object" && request.query !== null
      ? (request.query as Record<string, unknown>).apiKey
      : undefined;
  const expected = process.env.API_KEY ?? env.API_KEY;
  const validHeader = typeof incomingKey === "string" && incomingKey === expected;
  const validQuery = typeof queryKey === "string" && queryKey === expected;
  if (!validHeader && !validQuery) {
    reply.status(401).send({ message: "Unauthorized: invalid API key" });
  }
}
