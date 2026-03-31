export type SpaceInput = {
  placeId: string;
  name: string;
  reference?: string;
  capacity: number;
  description?: string;
};

export type ReservationInput = {
  spaceId: string;
  placeId?: string;
  clientEmail: string;
  reservationDate: string;
  startTime: string;
  endTime: string;
};

export type TelemetryEvent = {
  spaceId: string;
  placeId: string;
  occupancy: number;
  co2: number;
  humidity: number;
  temperature: number;
  battery: number;
  observedAt: Date;
  rawPayload: unknown;
};
