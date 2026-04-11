import type {
  DriverStanding,
  ConstructorStanding,
  Race,
  OpenF1Meeting,
  JolpicaDriverStandingsResponse,
  JolpicaConstructorStandingsResponse,
  JolpicaRaceScheduleResponse,
} from "./types";

// API Base URLs

const JOLPICA_BASE = "https://api.jolpi.ca/ergast/f1";
const OPENF1_BASE = "https://api.openf1.org/v1";

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}


async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    next: { revalidate: 300 }, // Cache for 5 minutes
  });

  if (!res.ok) {
    throw new ApiError(
      `API request failed: ${res.status} ${res.statusText}`,
      res.status
    );
  }

  return res.json() as Promise<T>;
}

export async function getDriverStandings(
  limit = 10
): Promise<DriverStanding[]> {
  const data = await fetchJson<JolpicaDriverStandingsResponse>(
    `${JOLPICA_BASE}/current/driverStandings.json?limit=${limit}`
  );

  const lists = data.MRData.StandingsTable.StandingsLists;
  if (!lists || lists.length === 0) return [];

  return lists[0].DriverStandings;
}


export async function getConstructorStandings(
  limit = 10
): Promise<ConstructorStanding[]> {
  const data = await fetchJson<JolpicaConstructorStandingsResponse>(
    `${JOLPICA_BASE}/current/constructorStandings.json?limit=${limit}`
  );

  const lists = data.MRData.StandingsTable.StandingsLists;
  if (!lists || lists.length === 0) return [];

  return lists[0].ConstructorStandings;
}

export async function getSeasonSchedule(): Promise<Race[]> {
  const data = await fetchJson<JolpicaRaceScheduleResponse>(
    `${JOLPICA_BASE}/current.json`
  );

  return data.MRData.RaceTable.Races;
}

export async function getNextRace(): Promise<Race | null> {
  const races = await getSeasonSchedule();
  const now = new Date();

  for (const race of races) {
    const raceDate = new Date(`${race.date}T${race.time}`);
    if (raceDate > now) {
      return race;
    }
  }

  return races.length > 0 ? races[races.length - 1] : null;
}

export async function getSeasonInfo(): Promise<{
  season: string;
  round: string;
}> {
  const data = await fetchJson<JolpicaDriverStandingsResponse>(
    `${JOLPICA_BASE}/current/driverStandings.json?limit=1`
  );

  const lists = data.MRData.StandingsTable.StandingsLists;
  if (!lists || lists.length === 0)
    return { season: new Date().getFullYear().toString(), round: "0" };

  return {
    season: lists[0].season,
    round: lists[0].round,
  };
}

export async function getMeetings(
  year?: number
): Promise<OpenF1Meeting[]> {
  const currentYear = year || new Date().getFullYear();
  const data = await fetchJson<OpenF1Meeting[]>(
    `${OPENF1_BASE}/meetings?year=${currentYear}`
  );

  return data.filter(
    (m) => !m.meeting_name.toLowerCase().includes("testing")
  );
}

export function findMatchingMeeting(
  race: Race,
  meetings: OpenF1Meeting[]
): OpenF1Meeting | undefined {
  const exactMatch = meetings.find(
    (m) =>
      m.meeting_name.toLowerCase() === race.raceName.toLowerCase()
  );
  if (exactMatch) return exactMatch;

  return meetings.find(
    (m) =>
      m.location.toLowerCase().includes(race.Circuit.Location.locality.toLowerCase()) ||
      race.Circuit.Location.locality.toLowerCase().includes(m.location.toLowerCase()) ||
      m.circuit_short_name.toLowerCase().includes(race.Circuit.Location.locality.toLowerCase())
  );
}
