import {
  PaginatedReservations,
  PaginatedTelemetry,
  Place,
  Reservation,
  Space
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001";
const API_KEY = import.meta.env.VITE_API_KEY ?? "dev-api-key";

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(data.message ?? `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

export const api = {
  getPlaces: () => apiRequest<Place[]>("/lugares"),
  getSpaces: () => apiRequest<Space[]>("/espacios"),
  getSpaceById: (id: string) => apiRequest<Space>(`/espacios/${id}`),
  createReservation: (payload: Omit<Reservation, "id">) =>
    apiRequest<Reservation>("/reservas", { method: "POST", body: JSON.stringify(payload) }),
  listReservations: (page = 1, pageSize = 10) =>
    apiRequest<PaginatedReservations>(`/reservas?page=${page}&pageSize=${pageSize}`),
  deleteReservation: (id: string) => apiRequest<void>(`/reservas/${id}`, { method: "DELETE" }),
  listTelemetry: (page = 1, pageSize = 20) =>
    apiRequest<PaginatedTelemetry>(`/admin/telemetria?page=${page}&pageSize=${pageSize}`)
};

export function telemetryStreamUrl(): string {
  return `${API_BASE_URL}/admin/telemetria/stream?apiKey=${encodeURIComponent(API_KEY)}`;
}

export function apiKey(): string {
  return API_KEY;
}
