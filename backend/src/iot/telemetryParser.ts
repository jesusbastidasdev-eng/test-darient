import { z } from "zod";

import { TelemetryEvent } from "../types.js";

const incomingSchema = z.object({
  office: z.string().optional(),
  officeId: z.string().optional(),
  site: z.string().optional(),
  siteId: z.string().optional(),
  occupancy: z.coerce.number().int().nonnegative(),
  co2: z.coerce.number().nonnegative(),
  humidity: z.coerce.number().nonnegative(),
  temperature: z.coerce.number(),
  battery: z.coerce.number().nonnegative(),
  observedAt: z.string().datetime().optional(),
  timestamp: z.string().datetime().optional()
});

export function parseTelemetryPayload(payload: Buffer): TelemetryEvent {
  const raw = JSON.parse(payload.toString("utf8")) as unknown;
  const parsed = incomingSchema.parse(raw);
  const spaceId = parsed.office ?? parsed.officeId;
  const placeId = parsed.site ?? parsed.siteId;
  if (!spaceId || !placeId) {
    throw new Error("Telemetry payload requires office/officeId and site/siteId");
  }
  const observedAt = parsed.observedAt ?? parsed.timestamp ?? new Date().toISOString();

  return {
    spaceId,
    placeId,
    occupancy: parsed.occupancy,
    co2: parsed.co2,
    humidity: parsed.humidity,
    temperature: parsed.temperature,
    battery: parsed.battery,
    observedAt: new Date(observedAt),
    rawPayload: raw
  };
}
