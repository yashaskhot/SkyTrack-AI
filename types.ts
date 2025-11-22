export interface AviationStackFlight {
  flight_date: string;
  flight_status: string;
  departure: {
    airport: string;
    timezone: string;
    iata: string;
    icao: string;
    terminal: string;
    gate: string;
    delay: number;
    scheduled: string;
    estimated: string;
    actual: string;
    estimated_runway: string;
    actual_runway: string;
  } | null;
  arrival: {
    airport: string;
    timezone: string;
    iata: string;
    icao: string;
    terminal: string;
    gate: string;
    baggage: string;
    delay: number;
    scheduled: string;
    estimated: string;
    actual: string;
    estimated_runway: string;
    actual_runway: string;
  } | null;
  airline: {
    name: string;
    iata: string;
    icao: string;
  } | null;
  flight: {
    number: string;
    iata: string;
    icao: string;
    codeshared: any;
  } | null;
  aircraft: {
    registration: string;
    iata: string;
    icao: string;
    icao24: string;
  } | null;
  live: {
    updated: string;
    latitude: number;
    longitude: number;
    altitude: number;
    direction: number;
    speed_horizontal: number;
    speed_vertical: number;
    is_ground: boolean;
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