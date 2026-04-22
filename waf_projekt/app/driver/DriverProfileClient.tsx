"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getDriverSeasonResults, getDriverCareerStats } from "../lib/api";

const countryToCode: Record<string, string> = {
  "Bahrain": "bh", "Saudi Arabia": "sa", "Australia": "au",
  "Japan": "jp", "China": "cn", "USA": "us", "United States": "us",
  "Italy": "it", "Monaco": "mc", "Canada": "ca", "Spain": "es",
  "Austria": "at", "UK": "gb", "Hungary": "hu", "Belgium": "be",
  "Netherlands": "nl", "Singapore": "sg", "Azerbaijan": "az",
  "Qatar": "qa", "Mexico": "mx", "Brazil": "br", "UAE": "ae"
};

interface DriverInfo {
  driverId: string;
  code: string;
  givenName: string;
  familyName: string;
  permanentNumber: string;
  nationality: string;
  team: string;
  constructorId: string;
}

interface Props {
  drivers: DriverInfo[];
}

interface RaceResult {
  round: string;
  gp: string;
  pos: string;
  pts: string;
  flagUrl: string;
}

export default function DriverProfileClient({ drivers }: Props) {
  // Search state
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Driver data state
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [results, setResults] = useState<RaceResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    races: "--",
    wins: "--",
    podiums: "--",
    poles: "--"
  });

  const driver = selectedId
    ? drivers.find((d) => d.driverId === selectedId) ?? null
    : null;

  // Filter drivers based on query
  const filteredDrivers = query.trim().length === 0
    ? drivers
    : drivers.filter((d) => {
        const fullName = `${d.givenName} ${d.familyName}`.toLowerCase();
        const q = query.toLowerCase();
        return (
          fullName.includes(q) ||
          d.code.toLowerCase().includes(q) ||
          d.team.toLowerCase().includes(q) ||
          d.permanentNumber.includes(q)
        );
      });

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset highlight when filtered list changes
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [filteredDrivers.length]);

  // Select a driver
  const selectDriver = useCallback((driverId: string) => {
    setSelectedId(driverId);
    const d = drivers.find((dr) => dr.driverId === driverId);
    if (d) {
      setQuery(`${d.givenName} ${d.familyName}`);
    }
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.blur();
  }, [drivers]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredDrivers.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredDrivers.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredDrivers[highlightedIndex]) {
          selectDriver(filteredDrivers[highlightedIndex].driverId);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  // Fetch driver data
  useEffect(() => {
    if (!selectedId) return;

    let cancelled = false;

    async function fetchData() {
      setIsLoading(true);
      try {
        // Fetch career stats and season results in parallel
        const [statsData, races] = await Promise.all([
          getDriverCareerStats(selectedId!),
          getDriverSeasonResults(selectedId!)
        ]);

        if (cancelled) return;

        setStats(statsData);

        const formattedResults = races.map((race: any) => {
          const country = race.Circuit.Location.country;
          const countryCode = countryToCode[country] || "un";

          return {
            round: race.round.padStart(2, "0"),
            gp: race.raceName,
            pos: race.Results[0].positionText,
            pts: race.Results[0].points,
            flagUrl: `https://flagcdn.com/24x18/${countryCode}.png`
          };
        });

        setResults(formattedResults);
      } catch (error) {
        if (!cancelled) {
          console.error("Chyba při načítání dat o jezdci:", error);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [selectedId]);

  // Highlight matching text
  const highlightMatch = (text: string) => {
    if (!query.trim()) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <span className="search-highlight">{text.slice(idx, idx + query.length)}</span>
        {text.slice(idx + query.length)}
      </>
    );
  };

  return (
    <>
      {/* Autocomplete search bar */}
      <div className="driver-search-wrapper" id="driver-search" ref={searchRef}>
        <div className="driver-search-input-wrapper">
          <svg
            className="driver-search-icon"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            className="driver-search-input"
            placeholder="Search driver by name, code or team…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
              // Clear selection when user starts typing something new
              if (driver && e.target.value !== `${driver.givenName} ${driver.familyName}`) {
                // keep selectedId so current profile stays visible
              }
            }}
            onFocus={() => {
              setIsOpen(true);
              // Select all text on focus for easy re-search
              inputRef.current?.select();
            }}
            onKeyDown={handleKeyDown}
            aria-label="Search drivers"
            aria-expanded={isOpen}
            aria-autocomplete="list"
            autoComplete="off"
          />
          {query && (
            <button
              className="driver-search-clear"
              onClick={() => {
                setQuery("");
                setIsOpen(true);
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
              type="button"
            >
              ✕
            </button>
          )}
        </div>

        {isOpen && (
          <ul className="driver-search-results" role="listbox">
            {filteredDrivers.length === 0 ? (
              <li className="driver-search-empty">No drivers found</li>
            ) : (
              filteredDrivers.map((d, index) => (
                <li
                  key={d.driverId}
                  role="option"
                  aria-selected={highlightedIndex === index}
                  className={`driver-search-item${
                    highlightedIndex === index ? " highlighted" : ""
                  }${d.driverId === selectedId ? " selected" : ""}`}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onClick={() => selectDriver(d.driverId)}
                >
                  <span className="driver-search-item-number">{d.permanentNumber}</span>
                  <span className="driver-search-item-name">
                    {highlightMatch(`${d.givenName} ${d.familyName}`)}
                  </span>
                  <span className="driver-search-item-team">
                    {highlightMatch(d.team)}
                  </span>
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      {/* Prompt when no driver selected */}
      {!driver && !isLoading && (
        <div className="driver-empty-state">
          <div className="driver-empty-icon">🏎️</div>
          <h2 className="driver-empty-title">Select a Driver</h2>
          <p className="driver-empty-text">
            Use the search bar above to find a driver and view their profile, career stats
            and 2026 season results.
          </p>
        </div>
      )}

      {driver && (
        <>
          {/* Driver hero card */}
          <div className="driver-hero" id="driver-hero">
            <div className="driver-hero-photo">
              <span className="driver-hero-photo-placeholder">
                Photo<br />Placeholder
              </span>
            </div>

            <div className="driver-hero-info">
              <div className="driver-hero-number">{driver.permanentNumber}</div>

              <div className="driver-hero-details">
                <h2 className="driver-hero-name">
                  <span className="driver-hero-given">{driver.givenName}</span>
                  <span className="driver-hero-family">{driver.familyName}</span>
                </h2>
                <div className="driver-hero-team">
                  <span className="driver-hero-team-badge">{driver.team}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="driver-stats-grid">
            <div className="driver-stat-card">
              <span className="driver-stat-value">{stats.races}</span>
              <span className="driver-stat-label">Races</span>
            </div>
            <div className="driver-stat-card">
              <span className="driver-stat-value">{stats.wins}</span>
              <span className="driver-stat-label">Wins</span>
            </div>
            <div className="driver-stat-card">
              <span className="driver-stat-value">{stats.podiums}</span>
              <span className="driver-stat-label">Podiums</span>
            </div>
            <div className="driver-stat-card">
              <span className="driver-stat-value">{stats.poles}</span>
              <span className="driver-stat-label">Pole Pos.</span>
            </div>
          </div>

          <div className="section-bar">
            Results – 2026 season
          </div>

          <div className="results-table-wrapper">
            <table className="results-table-flat">
              <thead>
                <tr>
                  <th>Round</th>
                  <th>Grand Prix</th>
                  <th>Position</th>
                  <th>Pts</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
                      Loading data...
                    </td>
                  </tr>
                ) : results.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
                      No results found for this season yet.
                    </td>
                  </tr>
                ) : (
                  results.map((race, index) => (
                    <tr key={index}>
                      <td>{race.round}</td>
                      <td>
                        <div className="gp-cell">
                          <img
                            src={race.flagUrl}
                            alt="Country flag"
                            className="gp-flag"
                            loading="lazy"
                          />
                          <span>{race.gp}</span>
                        </div>
                      </td>
                      <td>{race.pos}</td>
                      <td>{race.pts}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <button className="compare-btn">
            Compare this driver <span>→</span>
          </button>
        </>
      )}
    </>
  );
}