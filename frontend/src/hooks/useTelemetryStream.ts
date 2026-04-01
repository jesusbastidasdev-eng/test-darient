import { useEffect } from "react";

import { telemetryStreamUrl } from "../lib/api";
import { TelemetryLiveState } from "../types";

export type UseTelemetryStreamOptions = {
  onTelemetry: (event: TelemetryLiveState) => void;
  onError?: () => void;
};

export function useTelemetryStream({ onTelemetry, onError }: UseTelemetryStreamOptions): void {
  useEffect(() => {
    const source = new EventSource(telemetryStreamUrl());
    source.onmessage = (event) => {
      try {
        onTelemetry(JSON.parse(event.data) as TelemetryLiveState);
      } catch {
        onError?.();
      }
    };
    source.onerror = () => onError?.();
    return () => source.close();
  }, [onError, onTelemetry]);
}
