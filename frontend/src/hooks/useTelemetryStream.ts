import { useEffect } from "react";

import { telemetryStreamUrl } from "../lib/api";
import { TelemetryLiveState } from "../types";

type UseTelemetryStreamOptions = {
  onTelemetry: (event: TelemetryLiveState) => void;
  onError?: () => void;
};

export function useTelemetryStream(options: UseTelemetryStreamOptions): void {
  useEffect(() => {
    const source = new EventSource(telemetryStreamUrl());
    source.onmessage = (event) => {
      try {
        options.onTelemetry(JSON.parse(event.data) as TelemetryLiveState);
      } catch {
        options.onError?.();
      }
    };
    source.onerror = () => options.onError?.();
    return () => source.close();
  }, [options]);
}
