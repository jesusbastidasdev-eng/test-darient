import { PrismaClient } from "@prisma/client";

import { AppError } from "../errors.js";
import { TelemetryEvent } from "../types.js";

export class TelemetryService {
  constructor(private readonly prisma: PrismaClient) {}

  async ingest(event: TelemetryEvent): Promise<void> {
    const space = await this.prisma.space.findUnique({ where: { id: event.spaceId } });
    if (!space) {
      throw new AppError(`Telemetry references unknown space '${event.spaceId}'`, 404);
    }

    await this.prisma.telemetrySample.create({
      data: {
        spaceId: event.spaceId,
        placeId: event.placeId,
        occupancy: event.occupancy,
        co2: event.co2,
        humidity: event.humidity,
        temperature: event.temperature,
        battery: event.battery,
        observedAt: event.observedAt,
        rawPayload: event.rawPayload as object
      }
    });

    await this.prisma.spaceLiveState.upsert({
      where: { spaceId: event.spaceId },
      create: {
        spaceId: event.spaceId,
        placeId: event.placeId,
        occupancy: event.occupancy,
        co2: event.co2,
        humidity: event.humidity,
        temperature: event.temperature,
        battery: event.battery,
        observedAt: event.observedAt
      },
      update: {
        placeId: event.placeId,
        occupancy: event.occupancy,
        co2: event.co2,
        humidity: event.humidity,
        temperature: event.temperature,
        battery: event.battery,
        observedAt: event.observedAt
      }
    });
  }
}
