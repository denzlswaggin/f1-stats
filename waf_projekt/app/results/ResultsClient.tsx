"use client";

import Image from "next/image";
import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";


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

interface UpcomingRaceInfo {
  raceName: string;
  circuitName: string;
  locality: string;
  country: string;
  date: string;
  time: string;
  round: string;
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
  const [upcomingRace, setUpcomingRace] = useState<UpcomingRaceInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSeasonOpen, setIsSeasonOpen] = useState(false);
  const [countdownNow, setCountdownNow] = useState<Date>(new Date());
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

  // Sync state when initial props change (URL navigation)
  useEffect(() => {
    setSelectedSeason(parseInt(initialSeason));
    setCurrentRound(parseInt(initialRace.round));
    setTotalRounds(initialTotalRounds);
    setResults(initialResults);
    setRaceInfo(initialRace);

    // If initial results are empty, set upcoming race from initial race data
    if (initialResults.length === 0 && initialRace.raceName !== "No Data") {
      setUpcomingRace({
        raceName: initialRace.raceName,
        circuitName: initialRace.circuitName,
        locality: initialRace.locality,
        country: initialRace.country,
        date: initialRace.date,
        time: "14:00:00Z",
        round: initialRace.round,
      });
    } else {
      setUpcomingRace(null);
    }
  }, [initialSeason, initialRace, initialResults, initialTotalRounds]);

  // Live countdown timer for upcoming races
  useEffect(() => {
    if (!upcomingRace) return;
    const timer = setInterval(() => setCountdownNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, [upcomingRace]);

  // Fetch results when season or round changes (client-side only)
  useEffect(() => {
    if (
      selectedSeason === parseInt(initialSeason) &&
      currentRound === parseInt(initialRace.round)
    ) {
      setResults(initialResults);
      setRaceInfo(initialRace);
      if (initialResults.length > 0) {
        setUpcomingRace(null);
      }
      return;
    }

    let cancelled = false;

    async function fetchResults() {
      setIsLoading(true);
      setUpcomingRace(null);

      const minDelay = new Promise((r) => setTimeout(r, 400));

      try {
        const [res] = await Promise.all([
          fetch(
            `https://api.jolpi.ca/ergast/f1/${selectedSeason}/${currentRound}/results.json`
          ),
          minDelay,
        ]);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        const races = data.MRData.RaceTable.Races;

        if (!cancelled && races.length > 0) {
          const race = races[0];

          // Check if this race has results
          if (race.Results && race.Results.length > 0) {
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
            setUpcomingRace(null);
          } else {
            // Race exists but no results → try schedule
            setResults([]);
            await fetchUpcomingRaceInfo(cancelled);
          }
        } else if (!cancelled) {
          // No race data in results endpoint → try schedule
          setResults([]);
          await fetchUpcomingRaceInfo(cancelled);
        }
      } catch (error) {
        console.error("Error fetching results:", error);
        if (!cancelled) {
          setResults([]);
          await fetchUpcomingRaceInfo(cancelled);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    async function fetchUpcomingRaceInfo(cancelled: boolean) {
      try {
        const schedRes = await fetch(
          `https://api.jolpi.ca/ergast/f1/${selectedSeason}/${currentRound}.json`
        );
        if (!schedRes.ok) throw new Error("Schedule fetch failed");
        const schedData = await schedRes.json();
        const schedRaces = schedData.MRData.RaceTable.Races;

        if (!cancelled && schedRaces.length > 0) {
          const sRace = schedRaces[0];
          setUpcomingRace({
            raceName: sRace.raceName,
            circuitName: sRace.Circuit.circuitName,
            locality: sRace.Circuit.Location.locality,
            country: sRace.Circuit.Location.country,
            date: sRace.date,
            time: sRace.time || "14:00:00Z",
            round: sRace.round,
          });
          setRaceInfo({
            round: sRace.round,
            raceName: sRace.raceName,
            date: sRace.date,
            circuitName: sRace.Circuit.circuitName,
            country: sRace.Circuit.Location.country,
            locality: sRace.Circuit.Location.locality,
          });
        } else if (!cancelled) {
          setUpcomingRace(null);
          setRaceInfo({
            round: currentRound.toString(),
            raceName: "No Data",
            date: "",
            circuitName: "",
            country: "",
            locality: "",
          });
        }
      } catch {
        if (!cancelled) {
          setUpcomingRace(null);
          setRaceInfo({
            round: currentRound.toString(),
            raceName: "No Data",
            date: "",
            circuitName: "",
            country: "",
            locality: "",
          });
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
      const newRound = currentRound - 1;
      setCurrentRound(newRound);
      window.history.replaceState(null, "", `/results/${selectedSeason}/${newRound}`);
    }
  }

  function handleNextRace() {
    if (currentRound < totalRounds) {
      const newRound = currentRound + 1;
      setCurrentRound(newRound);
      window.history.replaceState(null, "", `/results/${selectedSeason}/${newRound}`);
    }
  }

  function handleSeasonChange(year: number) {
    setSelectedSeason(year);
    setIsSeasonOpen(false);
    // Round will be reset by the season useEffect above
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
        <div className="results-title-actions">
          {/* Link back to schedule */}
          <Link
            href={`/schedule/${selectedSeason}`}
            className="results-schedule-link"
            title={`View ${selectedSeason} schedule`}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Schedule
          </Link>

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
                    onClick={() => handleSeasonChange(year)}
                  >
                    {year}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Results table */}
      <div
        key={isLoading ? "loading" : `content-${selectedSeason}-${currentRound}`}
        className="results-content-transition"
      >
        {isLoading ? (
          <div className="results-loading">
            <div className="results-loading-spinner" />
            <span className="results-loading-text">Loading results…</span>
          </div>
        ) : results.length === 0 && upcomingRace ? (
          <UpcomingRaceCard race={upcomingRace} now={countdownNow} season={selectedSeason} />
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
                          {/* Driver name → link to driver profile */}
                          <Link
                            href={`/driver/${result.driverId}`}
                            className="results-driver-link"
                          >
                            <span className="results-driver-name">
                              {result.driverName}
                              <span className="results-driver-code">{result.driverCode}</span>
                            </span>
                          </Link>
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
      </div>

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

/* ─── Upcoming Race Card ─── */

function UpcomingRaceCard({
  race,
  now,
  season,
}: {
  race: UpcomingRaceInfo;
  now: Date;
  season: number;
}) {
  const raceDate = useMemo(
    () => new Date(`${race.date}T${race.time}`),
    [race.date, race.time]
  );
  const isPast = raceDate < now;

  const countdown = useMemo(() => {
    if (isPast) return null;
    const diff = raceDate.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return { days, hours, minutes, seconds };
  }, [raceDate, now, isPast]);

  const formattedDate = useMemo(() => {
    return raceDate.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, [raceDate]);

  const formattedTime = useMemo(() => {
    return raceDate.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });
  }, [raceDate]);

  return (
    <div className="upcoming-race-card" id="upcoming-race">
      <Image width={500} height={500}
        src={`/tracks/${race.locality.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "")}.jpg`}
        alt={race.locality}
        className="upcoming-race-bg"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />

      <div className="upcoming-race-badge">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        {isPast ? "Awaiting Results" : "Upcoming Race"}
      </div>

      <h2 className="upcoming-race-name">{race.raceName}</h2>

      <div className="upcoming-race-meta">
        <div className="upcoming-race-meta-item">
          <Image src="/pin.png" alt="Circuit" width={14} height={14} className="upcoming-meta-icon" />
          <span>{race.circuitName}</span>
        </div>
        <div className="upcoming-race-meta-item">
          <Image src="/location.png" alt="Location" width={14} height={14} className="upcoming-meta-icon" />
          <span>{race.locality}, {race.country}</span>
        </div>
        <div className="upcoming-race-meta-item">
          <Image src="/calendar.png" alt="Date and Time" width={14} height={14} className="upcoming-meta-icon" />
          <span>{formattedDate} · {formattedTime}</span>
        </div>
      </div>

      {countdown && (
        <div className="upcoming-countdown">
          <div className="upcoming-countdown-grid">
            <div className="upcoming-countdown-unit">
              <span className="upcoming-countdown-value">{String(countdown.days).padStart(2, "0")}</span>
              <span className="upcoming-countdown-text">Days</span>
            </div>
            <span className="upcoming-countdown-sep">:</span>
            <div className="upcoming-countdown-unit">
              <span className="upcoming-countdown-value">{String(countdown.hours).padStart(2, "0")}</span>
              <span className="upcoming-countdown-text">Hrs</span>
            </div>
            <span className="upcoming-countdown-sep">:</span>
            <div className="upcoming-countdown-unit">
              <span className="upcoming-countdown-value">{String(countdown.minutes).padStart(2, "0")}</span>
              <span className="upcoming-countdown-text">Min</span>
            </div>
            <span className="upcoming-countdown-sep">:</span>
            <div className="upcoming-countdown-unit">
              <span className="upcoming-countdown-value">{String(countdown.seconds).padStart(2, "0")}</span>
              <span className="upcoming-countdown-text">Sec</span>
            </div>
          </div>
        </div>
      )}

      {isPast && (
        <p className="upcoming-race-pending">
          The race has finished — results are being processed and will appear shortly.
        </p>
      )}

      <Link
        href={`/schedule/${season}`}
        className="upcoming-schedule-link"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        View Full Schedule
      </Link>
    </div>
  );
}
