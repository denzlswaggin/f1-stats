"use client";

import { useState, useEffect, useRef } from "react";

// Country name → country code mapping for flags
const countryToCode: Record<string, string> = {
  "Bahrain": "bh", "Saudi Arabia": "sa", "Australia": "au",
  "Japan": "jp", "China": "cn", "USA": "us", "United States": "us",
  "Italy": "it", "Monaco": "mc", "Canada": "ca", "Spain": "es",
  "Austria": "at", "UK": "gb", "Hungary": "hu", "Belgium": "be",
  "Netherlands": "nl", "Singapore": "sg", "Azerbaijan": "az",
  "Qatar": "qa", "Mexico": "mx", "Brazil": "br", "UAE": "ae",
  "Portugal": "pt", "France": "fr", "Russia": "ru", "Turkey": "tr",
  "Germany": "de", "Malaysia": "my", "Korea": "kr", "India": "in",
  "Abu Dhabi": "ae", "South Africa": "za", "Argentina": "ar",
  "Sweden": "se", "Switzerland": "ch",
};

interface RaceData {
  round: string;
  raceName: string;
  date: string;
  time: string;
  circuitName: string;
  country: string;
  locality: string;
}

interface Props {
  initialRaces: RaceData[];
  initialSeason: string;
}

// Generate season options
const CURRENT_YEAR = new Date().getFullYear();
const SEASON_OPTIONS = Array.from({ length: CURRENT_YEAR - 1949 }, (_, i) => CURRENT_YEAR - i);

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
}

function getRaceStatus(dateStr: string, timeStr: string): "completed" | "next-race" | "upcoming" {
  const now = new Date();
  const raceDateTime = new Date(`${dateStr}T${timeStr || "14:00:00Z"}`);
  
  if (raceDateTime < now) {
    return "completed";
  }
  
  return "upcoming";
}

function findNextRaceIndex(races: RaceData[]): number {
  const now = new Date();
  for (let i = 0; i < races.length; i++) {
    const raceDateTime = new Date(`${races[i].date}T${races[i].time || "14:00:00Z"}`);
    if (raceDateTime > now) {
      return i;
    }
  }
  return -1;
}

export default function ScheduleClient({ initialRaces, initialSeason }: Props) {
  const [selectedSeason, setSelectedSeason] = useState<number>(parseInt(initialSeason));
  const [isSeasonOpen, setIsSeasonOpen] = useState(false);
  const [races, setRaces] = useState<RaceData[]>(initialRaces);
  const [isLoading, setIsLoading] = useState(false);
  const seasonRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (seasonRef.current && !seasonRef.current.contains(e.target as Node)) {
        setIsSeasonOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch new season data when season changes
  useEffect(() => {
    if (selectedSeason === parseInt(initialSeason)) {
      setRaces(initialRaces);
      return;
    }

    let cancelled = false;

    async function fetchSeason() {
      setIsLoading(true);
      try {
        const res = await fetch(
          `https://api.jolpi.ca/ergast/f1/${selectedSeason}.json`
        );
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        const fetchedRaces: RaceData[] = data.MRData.RaceTable.Races.map((race: any) => ({
          round: race.round,
          raceName: race.raceName,
          date: race.date,
          time: race.time || "14:00:00Z",
          circuitName: race.Circuit.circuitName,
          country: race.Circuit.Location.country,
          locality: race.Circuit.Location.locality,
        }));

        if (!cancelled) {
          setRaces(fetchedRaces);
        }
      } catch (error) {
        console.error("Error fetching schedule:", error);
        if (!cancelled) {
          setRaces([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchSeason();
    return () => { cancelled = true; };
  }, [selectedSeason, initialSeason, initialRaces]);

  const nextRaceIndex = findNextRaceIndex(races);

  return (
    <>
      {/* Season header bar */}
      <div className="schedule-header-bar" id="schedule-season-header">
        <span className="schedule-header-text">
          Schedule – {selectedSeason} Season
        </span>
        <div className="schedule-season-selector" ref={seasonRef}>
          <button
            className="schedule-season-btn"
            onClick={() => setIsSeasonOpen(!isSeasonOpen)}
            aria-label="Select season"
            type="button"
          >
            {selectedSeason}
            <svg
              className={`schedule-season-chevron${isSeasonOpen ? " open" : ""}`}
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {isSeasonOpen && (
            <ul className="schedule-season-dropdown" role="listbox">
              {SEASON_OPTIONS.map((year) => (
                <li
                  key={year}
                  role="option"
                  aria-selected={selectedSeason === year}
                  className={`schedule-season-dropdown-item${selectedSeason === year ? " active" : ""}`}
                  onClick={() => {
                    setSelectedSeason(year);
                    setIsSeasonOpen(false);
                  }}
                >
                  {year}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Race list */}
      {isLoading ? (
        <div className="schedule-loading">
          <div className="schedule-loading-spinner" />
          <span className="schedule-loading-text">Loading {selectedSeason} schedule…</span>
        </div>
      ) : races.length === 0 ? (
        <div className="schedule-empty">
          <div className="schedule-empty-icon">📅</div>
          <h2 className="schedule-empty-title">No Races Found</h2>
          <p className="schedule-empty-text">
            No race schedule available for the {selectedSeason} season.
          </p>
        </div>
      ) : (
        <>
          <div className="schedule-race-list" id="schedule-race-list">
            {races.map((race, index) => {
              const status = index === nextRaceIndex
                ? "next-race"
                : getRaceStatus(race.date, race.time);

              const countryCode = countryToCode[race.country] || "un";
              const flagUrl = `https://flagcdn.com/24x18/${countryCode}.png`;
              const roundPadded = race.round.padStart(2, "0");

              return (
                <div
                  key={`${selectedSeason}-${race.round}`}
                  className={`schedule-race-row${status === "next-race" ? " next-race" : ""}`}
                  id={`schedule-race-${race.round}`}
                >
                  {/* Round number */}
                  <div className="schedule-round">{roundPadded}</div>

                  {/* Race info */}
                  <div className="schedule-race-info">
                    <div className="schedule-race-name">{race.raceName}</div>
                    <div className="schedule-race-details">
                      <span>{formatDate(race.date)}</span>
                      <span className="separator">–</span>
                      <img
                        src={flagUrl}
                        alt={race.country}
                        className="schedule-race-flag"
                        loading="lazy"
                      />
                      <span>{race.circuitName}</span>
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className="schedule-status">
                    <span className={`schedule-status-badge ${status}`}>
                      {status === "next-race"
                        ? "Next Race"
                        : status === "completed"
                        ? "Completed"
                        : "Upcoming"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="schedule-race-count">
            {races.length} races · {selectedSeason} season
          </div>
        </>
      )}
    </>
  );
}
