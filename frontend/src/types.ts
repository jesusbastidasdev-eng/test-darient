export type Place = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
};

export type Space = {
  id: string;
  placeId: string;
  name: string;
  reference?: string;
  capacity: number;
  description?: string;
  place?: Place;
};

export type Reservation = {
  id: string;
  spaceId: string;
  placeId?: string;
  clientEmail: string;
  reservationDate: string;
  startTime: string;
  endTime: string;
  space?: Space;
};

export type PaginatedReservations = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  items: Reservation[];
};

export type TelemetryLiveState = {
  id: string;
  spaceId: string;
  placeId: string;
  occupancy: number;
  co2: number;
  humidity: number;
  temperature: number;
  battery: number;
  observedAt: string;
  space?: Space;
};

export type PaginatedTelemetry = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  items: TelemetryLiveState[];
};
