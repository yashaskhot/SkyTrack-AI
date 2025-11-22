
export interface AviationStackFlight {
  flight_date: string | null;
  flight_status: string | null;
  departure: {
    airport: string | null;
    timezone: string | null;
    iata: string | null;
    icao: string | null;
    terminal: string | null;
    gate: string | null;
    delay: number | null;
    scheduled: string | null;
    estimated: string | null;
    actual: string | null;
    estimated_runway: string | null;
    actual_runway: string | null;
  } | null;
  arrival: {
    airport: string | null;
    timezone: string | null;
    iata: string | null;
    icao: string | null;
    terminal: string | null;
    gate: string | null;
    baggage: string | null;
    delay: number | null;
    scheduled: string | null;
    estimated: string | null;
    actual: string | null;
    estimated_runway: string | null;
    actual_runway: string | null;
  } | null;
  airline: {
    name: string | null;
    iata: string | null;
    icao: string | null;
  } | null;
  flight: {
    number: string | null;
    iata: string | null;
    icao: string | null;
    codeshared: any;
  } | null;
  aircraft: {
    registration: string | null;
    iata: string | null;
    icao: string | null;
    icao24: string | null;
  } | null;
  live: {
    updated: string | null;
    latitude: number | null;
    longitude: number | null;
    altitude: number | null;
    direction: number | null;
    speed_horizontal: number | null;
    speed_vertical: number | null;
    is_ground: boolean | null;
  } | null;
}

export interface FlightData {
  pagination: {
    limit: number;
    offset: number;
    count: number;
    total: number;
  };
  data: AviationStackFlight[];
}

export enum AppView {
  MAP = 'MAP',
  LIST = 'LIST',
  ANALYTICS = 'ANALYTICS'
}

export interface GeoJSONWorld {
  type: string;
  objects: {
    countries: {
      type: string;
      geometries: any[];
    };
    land: {
      type: string;
      geometries: any[];
    }
  };
  arcs: any[];
}
