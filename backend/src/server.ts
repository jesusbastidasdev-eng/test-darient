import { env } from "./config/env.js";
import { prisma } from "./db/prisma.js";
import { startMqttConsumer } from "./iot/mqttConsumer.js";
import { createApp } from "./app.js";
import { TelemetryService } from "./services/telemetryService.js";

async function bootstrap(): Promise<void> {
  const app = await createApp({ prisma });
  const telemetryService = new TelemetryService(prisma);
  const mqttClient = startMqttConsumer({
    onTelemetry: async (event) => {
      await telemetryService.ingest(event);
      app.log.info({ spaceId: event.spaceId, placeId: event.placeId }, "Telemetry ingested");
      app.realtimeSubscribers.forEach((subscriber) => subscriber(event));
    },
    onError: (error) => app.log.error(error),
    onStatus: (message, meta) => app.log.info(meta ?? {}, message)
  });

  app.addHook("onClose", async () => {
    mqttClient.end(true);
  });

  await app.listen({ port: env.PORT, host: "0.0.0.0" });
  app.log.info(`API listening on ${env.PORT}`);
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
