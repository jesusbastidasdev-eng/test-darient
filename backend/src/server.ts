import { env } from "./config/env.js";
import { prisma } from "./db/prisma.js";
import { startMqttConsumer } from "./iot/mqttConsumer.js";
import { createApp } from "./app.js";
import { TelemetryService } from "./services/telemetryService.js";

async function bootstrap(): Promise<void> {
  const app = await createApp({ prisma });
  const telemetryService = new TelemetryService(prisma);

  startMqttConsumer({
    onTelemetry: async (event) => {
      await telemetryService.ingest(event);
      app.realtimeSubscribers.forEach((subscriber) => subscriber(event));
    },
    onError: (error) => app.log.error(error)
  });

  await app.listen({ port: env.PORT, host: "0.0.0.0" });
  app.log.info(`API listening on ${env.PORT}`);
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
