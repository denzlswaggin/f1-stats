"use client";

import { useState, useEffect, useRef } from "react";

interface ResultData {
  position: string;
  positionText: string;
  points: string;
  driverName: string;
  driverCode: string;
  driverId: string;
  team: string;
  time: string;
  status: string;
  laps: string;
  grid: string;
  fastestLap?: string;
}

interface RaceInfo {
  round: string;
  raceName: string;
  date: string;
  circuitName: string;
  country: string;
  locality: string;
}

interface Props {
  initialResults: ResultData[];
  initialRace: RaceInfo;
  initialSeason: string;
  initialTotalRounds: number;
}

const CURRENT_YEAR = new Date().getFullYear();
const SEASON_OPTIONS = Array.from({ length: CURRENT_YEAR - 1949 }, (_, i) => CURRENT_YEAR - i);

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ResultsClient({
  initialResults,
  initialRace,
  initialSeason,
  initialTotalRounds,
}: Props) {
  const [selectedSeason, setSelectedSeason] = useState<number>(parseInt(initialSeason));
  const [currentRound, setCurrentRound] = useState<number>(parseInt(initialRace.round));
  const [totalRounds, setTotalRounds] = useState<number>(initialTotalRounds);
  const [results, setResults] = useState<ResultData[]>(initialResults);
  const [raceInfo, setRaceInfo] = useState<RaceInfo>(initialRace);
  const [isLoading, setIsLoading] = useState(false);
  const [isSeasonOpen, setIsSeasonOpen] = useState(false);
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

  // Fetch results when season or round changes
  useEffect(() => {
    if (
      selectedSeason === parseInt(initialSeason) &&
      currentRound === parseInt(initialRace.round)
    ) {
      setResults(initialResults);
      setRaceInfo(initialRace);
      return;
    }

    let cancelled = false;

    async function fetchResults() {
      setIsLoading(true);
      try {
        const res = await fetch(
          `https://api.jolpi.ca/ergast/f1/${selectedSeason}/${currentRound}/results.json`
        );
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        const races = data.MRData.RaceTable.Races;

        if (!cancelled && races.length > 0) {
          const race = races[0];
          setRaceInfo({
            round: race.round,
            raceName: race.raceName,
            date: race.date,
            circuitName: race.Circuit.circuitName,
            country: race.Circuit.Location.country,
            locality: race.Circuit.Location.locality,
          });
          setResults(
            race.Results.map((r: any) => ({
              position: r.position,
              positionText: r.positionText,
              points: r.points,
              driverName: `${r.Driver.givenName} ${r.Driver.familyName}`,
              driverCode: r.Driver.code,
              driverId: r.Driver.driverId,
              team: r.Constructor.name,
              time: r.Time?.time || "",
              status: r.status,
              laps: r.laps,
              grid: r.grid,
              fastestLap: r.FastestLap?.Time?.time,
            }))
          );
        } else if (!cancelled) {
          setResults([]);
          setRaceInfo({
            round: currentRound.toString(),
            raceName: "No Data",
            date: "",
            circuitName: "",
            country: "",
            locality: "",
          });
        }
      } catch (error) {
        console.error("Error fetching results:", error);
        if (!cancelled) {
          setResults([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchResults();
    return () => {
      cancelled = true;
    };
  }, [selectedSeason, currentRound, initialSeason, initialRace, initialResults]);

  // When season changes, fetch round count and reset to last race
  useEffect(() => {
    if (selectedSeason === parseInt(initialSeason)) {
      setTotalRounds(initialTotalRounds);
      return;
    }

    let cancelled = false;

    async function fetchSeasonInfo() {
      try {
        const res = await fetch(
          `https://api.jolpi.ca/ergast/f1/${selectedSeason}.json`
        );
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        const races = data.MRData.RaceTable.Races;

        if (!cancelled && races.length > 0) {
          setTotalRounds(races.length);
          // For past seasons, go to the last round. For current, go to the last completed
          const now = new Date();
          let lastCompletedRound = races.length;
          if (selectedSeason === CURRENT_YEAR) {
            for (let i = races.length - 1; i >= 0; i--) {
              const raceDate = new Date(`${races[i].date}T${races[i].time || "14:00:00Z"}`);
              if (raceDate < now) {
                lastCompletedRound = parseInt(races[i].round);
                break;
              }
            }
          }
          setCurrentRound(lastCompletedRound);
        }
      } catch (error) {
        console.error("Error fetching season info:", error);
      }
    }

    fetchSeasonInfo();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSeason]);

  function handlePrevRace() {
    if (currentRound > 1) {
      setCurrentRound(currentRound - 1);
    }
  }

  function handleNextRace() {
    if (currentRound < totalRounds) {
      setCurrentRound(currentRound + 1);
    }
  }

  return (
    <>
      {/* Race title bar */}
      <div className="results-race-title" id="results-race-title">
        <div className="results-race-title-text">
          <span className="results-label">Results</span>
          <span>{raceInfo.raceName}</span>
          <span className="results-race-round">R{raceInfo.round.padStart(2, "0")}</span>
        </div>
        <div className="results-season-selector" ref={seasonRef}>
          <button
            className="results-season-btn"
            onClick={() => setIsSeasonOpen(!isSeasonOpen)}
            aria-label="Select season"
            type="button"
          >
            {selectedSeason}
            <svg
              className={`results-season-chevron${isSeasonOpen ? " open" : ""}`}
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
            <ul className="results-season-dropdown" role="listbox">
              {SEASON_OPTIONS.map((year) => (
                <li
                  key={year}
                  role="option"
                  aria-selected={selectedSeason === year}
                  className={`results-season-dropdown-item${selectedSeason === year ? " active" : ""}`}
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

      {/* Results table */}
      {isLoading ? (
        <div className="results-loading">
          <div className="results-loading-spinner" />
          <span className="results-loading-text">Loading results…</span>
        </div>
      ) : results.length === 0 ? (
        <div className="results-empty">
          <div className="results-empty-icon">🏁</div>
          <h2 className="results-empty-title">No Results Available</h2>
          <p className="results-empty-text">
            Race results for this round are not yet available.
          </p>
        </div>
      ) : (
        <>
          <div className="results-table-container" id="results-table">
            <table className="results-table">
              <thead>
                <tr>
                  <th>Pos</th>
                  <th>Driver</th>
                  <th>Team</th>
                  <th className="results-col-time">Time / Gap</th>
                  <th>Pts</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => {
                  const pos = parseInt(result.position);
                  const isRetired = result.positionText === "R" || result.status === "Retired";
                  const isDNF = isRetired || result.status === "Disqualified";
                  const isWinner = pos === 1;
                  const pts = parseInt(result.points);

                  let rowClass = "";
                  if (pos === 1) rowClass = "results-row-p1";
                  else if (pos === 2) rowClass = "results-row-p2";
                  else if (pos === 3) rowClass = "results-row-p3";

                  let timeDisplay = result.time;
                  if (!timeDisplay && isDNF) {
                    timeDisplay = result.status === "Retired" ? "DNF" : result.status;
                  } else if (!timeDisplay) {
                    timeDisplay = result.status || "—";
                  }

                  return (
                    <tr key={result.position} className={rowClass}>
                      <td className="results-pos">
                        {isRetired ? result.positionText : result.position}
                      </td>
                      <td>
                        <span className="results-driver-name">
                          {result.driverName}
                          <span className="results-driver-code">{result.driverCode}</span>
                        </span>
                      </td>
                      <td className="results-team">{result.team}</td>
                      <td>
                        <span
                          className={`results-time${isWinner ? " results-winner-time" : ""}${isDNF ? " results-dnf" : ""}`}
                        >
                          {timeDisplay}
                        </span>
                      </td>
                      <td className={`results-pts${pts === 0 ? " results-no-points" : ""}`}>
                        {result.points}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Race info */}
          <div className="results-race-info">
            <span>{raceInfo.circuitName}</span>
            <span className="results-separator">·</span>
            <span>{raceInfo.locality}, {raceInfo.country}</span>
            {raceInfo.date && (
              <>
                <span className="results-separator">·</span>
                <span>{formatDate(raceInfo.date)}</span>
              </>
            )}
          </div>
        </>
      )}

      {/* Race navigation */}
      <div className="results-nav" id="results-navigation">
        <button
          className="results-nav-btn"
          onClick={handlePrevRace}
          disabled={currentRound <= 1}
          aria-label="Previous race"
          type="button"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Previous race
        </button>
        <button
          className="results-nav-btn"
          onClick={handleNextRace}
          disabled={currentRound >= totalRounds}
          aria-label="Next race"
          type="button"
        >
          Next race
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </>
  );
}
