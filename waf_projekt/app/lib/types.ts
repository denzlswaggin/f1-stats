
// Jolpica F1 API Types (Ergast-compatible)

export interface Driver {
  driverId: string;
  permanentNumber: string;
  code: string;
  url: string;
  givenName: string;
  familyName: string;
  dateOfBirth: string;
  nationality: string;
}

export interface Constructor {
  constructorId: string;
  url: string;
  name: string;
  nationality: string;
}

export interface DriverStanding {
  position: string;
  positionText: string;
  points: string;
  wins: string;
  Driver: Driver;
  Constructors: Constructor[];
}

export interface ConstructorStanding {
  position: string;
  positionText: string;
  points: string;
  wins: string;
  Constructor: Constructor;
}

export interface CircuitLocation {
  lat: string;
  long: string;
  locality: string;
  country: string;
}

export interface Circuit {
  circuitId: string;
  url: string;
  circuitName: string;
  Location: CircuitLocation;
}

export interface RaceSession {
  date: string;
  time: string;
}

export interface Race {
  season: string;
  round: string;
  url: string;
  raceName: string;
  Circuit: Circuit;
  date: string;
  time: string;
  FirstPractice?: RaceSession;
  SecondPractice?: RaceSession;
  ThirdPractice?: RaceSession;
  Qualifying?: RaceSession;
  Sprint?: RaceSession;
  SprintQualifying?: RaceSession;
}

export interface RaceResult {
  number: string;
  position: string;
  positionText: string;
  points: string;
  Driver: Driver;
  Constructor: Constructor;
  grid: string;
  laps: string;
  status: string;
  Time?: {
    millis: string;
    time: string;
  };
  FastestLap?: {
    rank: string;
    lap: string;
    Time: {
      time: string;
    };
  };
}

export interface RaceWithResults extends Race {
  Results: RaceResult[];
}

// OpenF1 API Types

export interface OpenF1Meeting {
  meeting_key: number;
  meeting_name: string;
  meeting_official_name: string;
  location: string;
  country_key: number;
  country_code: string;
  country_name: string;
  country_flag: string;
  circuit_key: number;
  circuit_short_name: string;
  circuit_type: string;
  circuit_info_url: string;
  circuit_image: string;
  gmt_offset: string;
  date_start: string;
  date_end: string;
  year: number;
}

// Jolpica API Response Wrappers

export interface JolpicaDriverStandingsResponse {
  MRData: {
    StandingsTable: {
      season: string;
      round: string;
      StandingsLists: Array<{
        season: string;
        round: string;
        DriverStandings: DriverStanding[];
      }>;
    };
  };
}

export interface JolpicaConstructorStandingsResponse {
  MRData: {
    StandingsTable: {
      season: string;
      round: string;
      StandingsLists: Array<{
        season: string;
        round: string;
        ConstructorStandings: ConstructorStanding[];
      }>;
    };
  };
}

export interface JolpicaRaceScheduleResponse {
  MRData: {
    RaceTable: {
      season: string;
      Races: Race[];
    };
  };
}

export interface JolpicaRaceResultsResponse {
  MRData: {
    RaceTable: {
      season: string;
      round: string;
      Races: RaceWithResults[];
    };
  };
}
