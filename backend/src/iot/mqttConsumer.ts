import mqtt, { MqttClient } from "mqtt";

import { env } from "../config/env.js";
import { parseTelemetryPayload } from "./telemetryParser.js";

type ConsumerHooks = {
  onTelemetry: (event: Awaited<ReturnType<typeof parseTelemetryPayload>>) => Promise<void>;
  onError?: (error: unknown) => void;
  onStatus?: (message: string, meta?: Record<string, unknown>) => void;
};

export function startMqttConsumer(hooks: ConsumerHooks): MqttClient {
  const client = mqtt.connect(env.MQTT_URL);

  client.on("connect", () => {
    hooks.onStatus?.("MQTT connected", { url: env.MQTT_URL });
    client.subscribe(env.MQTT_TOPIC, (error) => {
      if (error) {
        hooks.onError?.(error);
        return;
      }
      hooks.onStatus?.("MQTT subscribed", { topic: env.MQTT_TOPIC });
    });
  });

  client.on("reconnect", () => hooks.onStatus?.("MQTT reconnecting"));
  client.on("offline", () => hooks.onStatus?.("MQTT offline"));
  client.on("close", () => hooks.onStatus?.("MQTT connection closed"));

  client.on("message", (topic, payload) => {
    hooks.onStatus?.("MQTT message received", { topic, bytes: payload.length });
    void (async () => {
      try {
        const event = parseTelemetryPayload(payload);
        await hooks.onTelemetry(event);
      } catch (error) {
        hooks.onError?.(error);
      }
    })();
  });

  client.on("error", (error) => hooks.onError?.(error));

  return client;
}
