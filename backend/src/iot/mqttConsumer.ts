import mqtt, { MqttClient } from "mqtt";

import { env } from "../config/env.js";
import { parseTelemetryPayload } from "./telemetryParser.js";

type ConsumerHooks = {
  onTelemetry: (event: Awaited<ReturnType<typeof parseTelemetryPayload>>) => Promise<void>;
  onError?: (error: unknown) => void;
};

export function startMqttConsumer(hooks: ConsumerHooks): MqttClient {
  const client = mqtt.connect(env.MQTT_URL);

  client.on("connect", () => {
    client.subscribe(env.MQTT_TOPIC);
  });

  client.on("message", async (_topic, payload) => {
    try {
      const event = parseTelemetryPayload(payload);
      await hooks.onTelemetry(event);
    } catch (error) {
      hooks.onError?.(error);
    }
  });

  client.on("error", (error) => hooks.onError?.(error));

  return client;
}
