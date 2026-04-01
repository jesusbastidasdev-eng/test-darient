import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { EmptyState, ErrorState, LoadingState } from "../components/Status";
import { useTelemetryStream } from "../hooks/useTelemetryStream";
import { api } from "../lib/api";
import { TelemetryLiveState } from "../types";

export function AdminDashboardPage(): JSX.Element {
  const [liveMap, setLiveMap] = useState<Record<string, TelemetryLiveState>>({});
  const telemetryQuery = useQuery({ queryKey: ["telemetry"], queryFn: () => api.listTelemetry(1, 50) });
  const handleTelemetry = useCallback((event: TelemetryLiveState) => {
    setLiveMap((prev) => ({
      ...prev,
      [event.spaceId]: event
    }));
  }, []);

  useTelemetryStream({
    onTelemetry: handleTelemetry
  });

  const mergedItems = useMemo(() => {
    const base = telemetryQuery.data?.items ?? [];
    const merged = [...base];
    Object.values(liveMap).forEach((entry) => {
      const idx = merged.findIndex((item) => item.spaceId === entry.spaceId);
      if (idx >= 0) merged[idx] = entry;
      else merged.unshift(entry);
    });
    return merged;
  }, [telemetryQuery.data?.items, liveMap]);

  if (telemetryQuery.isLoading) return <LoadingState text="Loading telemetry..." />;
  if (telemetryQuery.isError) return <ErrorState message={(telemetryQuery.error as Error).message} />;
  if (!mergedItems.length) return <EmptyState text="No telemetry data yet." />;

  return (
    <section>
      <h2>Admin IoT Dashboard</h2>
      <p>Live telemetry updates arrive automatically when MQTT data is ingested.</p>
      <table>
        <thead>
          <tr>
            <th>Space</th>
            <th>Occupancy</th>
            <th>CO2</th>
            <th>Humidity</th>
            <th>Temperature</th>
            <th>Battery</th>
            <th>Observed At</th>
          </tr>
        </thead>
        <tbody>
          {mergedItems.map((item) => (
            <tr key={item.spaceId}>
              <td>{item.space?.name ?? item.spaceId}</td>
              <td>{item.occupancy}</td>
              <td>{item.co2}</td>
              <td>{item.humidity}</td>
              <td>{item.temperature}</td>
              <td>{item.battery}</td>
              <td>{new Date(item.observedAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
