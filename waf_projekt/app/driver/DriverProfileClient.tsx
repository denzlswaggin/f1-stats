"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getDriverSeasonResults, getDriverCareerStats } from "../lib/api";
import WavesBackground from "../components/WavesBackground";

const countryToCode: Record<string, string> = {
  "Bahrain": "bh", "Saudi Arabia": "sa", "Australia": "au",
  "Japan": "jp", "China": "cn", "USA": "us", "United States": "us",
  "Italy": "it", "Monaco": "mc", "Canada": "ca", "Spain": "es",
  "Austria": "at", "UK": "gb", "Hungary": "hu", "Belgium": "be",
  "Netherlands": "nl", "Singapore": "sg", "Azerbaijan": "az",
  "Qatar": "qa", "Mexico": "mx", "Brazil": "br", "UAE": "ae"
};

// Nationality → country code for flag display
const nationalityToCode: Record<string, string> = {
  "Dutch": "nl", "British": "gb", "Monegasque": "mc", "Australian": "au",
  "Spanish": "es", "Mexican": "mx", "Canadian": "ca", "German": "de",
  "French": "fr", "Finnish": "fi", "Japanese": "jp", "Chinese": "cn",
  "Thai": "th", "Danish": "dk", "American": "us", "Italian": "it",
  "Brazilian": "br", "New Zealander": "nz", "Algerian": "dz",
};

// Team colors for hero card backgrounds
const teamColors: Record<string, { primary: string; dark: string; accent: string }> = {
  "red_bull": { primary: "#1e41ff", dark: "#0a1a5c", accent: "#ffcd00" },
  "mclaren": { primary: "#ff8700", dark: "#4a2800", accent: "#47c7fc" },
  "ferrari": { primary: "#e8002d", dark: "#5a0011", accent: "#fff200" },
  "mercedes": { primary: "#27f4d2", dark: "#0a3d33", accent: "#00a19c" },
  "aston_martin": { primary: "#229971", dark: "#0a3326", accent: "#cedc00" },
  "alpine": { primary: "#ff87bc", dark: "#4a1f33", accent: "#0090ff" },
  "williams": { primary: "#64c4ff", dark: "#0a2d4a", accent: "#041e42" },
  "rb": { primary: "#6692ff", dark: "#1a2a5c", accent: "#ffffff" },
  "haas": { primary: "#b6babd", dark: "#2a2d2f", accent: "#e10600" },
  "audi": { primary: "#c40505ff", dark: "#4d0000ff", accent: "#e10600" },
  "cadillac": { primary: "#4d4d4dff", dark: "#2a2d2f", accent: "#adadadff" }
};

function getTeamColors(constructorId: string) {
  return teamColors[constructorId] || { primary: "#e10600", dark: "#3d0200", accent: "#ffffff" };
}

const driverPhotos: Record<string, string> = {
  // Red Bull
  max_verstappen: "/drivers/max_verstappen.avif",
  hadjar: "/drivers/isack_hadjar.avif",
  // Ferrari
  leclerc: "/drivers/charles_leclerc.avif",
  hamilton: "/drivers/lewis_hamilton.avif",
  // McLaren
  norris: "/drivers/lando_norris.avif",
  piastri: "/drivers/oscar_piastri.avif",
  // Mercedes
  russell: "/drivers/george_russel.avif",
  antonelli: "/drivers/kimi_antonelli.avif",
  // Aston Martin
  alonso: "/drivers/fernando_alonso.avif",
  stroll: "/drivers/lance_stroll.avif",
  // Alpine
  gasly: "/drivers/pierre_gasly.avif",
  colapinto: "/drivers/franco_colapinto.avif",
  // Williams
  albon: "/drivers/alexander_albon.avif",
  sainz: "/drivers/carlos_sainz.avif",
  // Haas
  ocon: "/drivers/esteban_ocon.avif",
  bearman: "/drivers/oliver_bearman.avif",
  // Audi
  hulkenberg: "/drivers/nico_hulkenberg.avif",
  bortoleto: "/drivers/gabriel_bortoleto.avif",
  // Racing Bulls
  lawson: "/drivers/liam_lawson.avif",
  lindblad: "/drivers/arvid_lindblad.avif",
  // Cadillac 
  perez: "/drivers/sergio_perez.avif",
  bottas: "/drivers/vallteri_bottas.avif",
};



function getDriverPhoto(driverId: string): string {
  return driverPhotos[driverId];
}

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

// Generate season options (current year down to 2000)
const CURRENT_YEAR = new Date().getFullYear();
const SEASON_OPTIONS = Array.from({ length: CURRENT_YEAR - 1999 }, (_, i) => CURRENT_YEAR - i);

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

  // Season selector state
  const [selectedSeason, setSelectedSeason] = useState<number>(CURRENT_YEAR);
  const [isSeasonOpen, setIsSeasonOpen] = useState(false);
  const seasonRef = useRef<HTMLDivElement>(null);

  // Photo loading state
  const [photoError, setPhotoError] = useState(false);

  const driver = selectedId
    ? drivers.find((d) => d.driverId === selectedId) ?? null
    : null;

  const currentBgColor = driver
    ? getTeamColors(driver.constructorId).primary
    : "#800000";

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
      if (seasonRef.current && !seasonRef.current.contains(e.target as Node)) {
        setIsSeasonOpen(false);
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
    setPhotoError(false);
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

  // Fetch driver data — responds to both selectedId AND selectedSeason
  useEffect(() => {
    if (!selectedId) return;

    let cancelled = false;

    async function fetchData() {
      setIsLoading(true);
      try {
        // Fetch career stats and season results in parallel
        const [statsData, races] = await Promise.all([
          getDriverCareerStats(selectedId!),
          getDriverSeasonResults(selectedId!, selectedSeason)
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
          setResults([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [selectedId, selectedSeason]);

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
      <WavesBackground linecolor={currentBgColor} />
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
                  className={`driver-search-item${highlightedIndex === index ? " highlighted" : ""
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

        </div>
      )}

      {driver && (
        <>
          {/* Driver hero card — F1 store style */}
          {(() => {
            const colors = getTeamColors(driver.constructorId);
            const flagCode = nationalityToCode[driver.nationality] || "un";
            return (
              <div
                className="driver-hero"
                id="driver-hero"
                style={{
                  "--team-primary": colors.primary,
                  "--team-dark": colors.dark,
                  "--team-accent": colors.accent,
                } as React.CSSProperties}
              >
                {/* Large background number watermark */}
                <div className="driver-hero-watermark" aria-hidden="true">
                  {driver.permanentNumber}
                </div>

                {/* Decorative stripes */}
                <div className="driver-hero-stripes" aria-hidden="true">
                  <div className="stripe" />
                  <div className="stripe" />
                </div>

                {/* Left: driver info */}
                <div className="driver-hero-content">
                  <h2 className="driver-hero-name">
                    <span className="driver-hero-given">{driver.givenName}</span>
                    <span className="driver-hero-family">{driver.familyName}</span>
                  </h2>

                  <div className="driver-hero-meta">
                    <span className="driver-hero-meta-item">
                      <img
                        src={`https://flagcdn.com/20x15/${flagCode}.png`}
                        alt={driver.nationality}
                        className="driver-hero-flag"
                      />
                      {driver.nationality}
                    </span>
                    <span className="driver-hero-meta-sep">|</span>
                    <span className="driver-hero-meta-item">{driver.team}</span>
                    <span className="driver-hero-meta-sep">|</span>
                    <span className="driver-hero-meta-item">{driver.permanentNumber}</span>
                  </div>
                </div>

                {/* Right: driver photo */}
                <div className="driver-hero-photo">
                  {!photoError && getDriverPhoto(driver.driverId) ? (
                    <img
                      src={getDriverPhoto(driver.driverId)}
                      alt={`${driver.givenName} ${driver.familyName}`}
                      className="driver-hero-photo-img"
                      onError={() => setPhotoError(true)}
                    />
                  ) : (
                    <div className="driver-hero-photo-fallback">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Career stats grid */}
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

          {/* Season results section with season selector */}
          <div className="section-bar" id="results-section">
            <span className="section-bar-text">Results – {selectedSeason} season</span>
            <div className="season-selector" ref={seasonRef}>
              <button
                className="season-selector-btn"
                onClick={() => setIsSeasonOpen(!isSeasonOpen)}
                aria-label="Select season"
                type="button"
              >
                {selectedSeason}
                <svg
                  className={`season-chevron${isSeasonOpen ? " open" : ""}`}
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
                <ul className="season-dropdown" role="listbox">
                  {SEASON_OPTIONS.map((year) => (
                    <li
                      key={year}
                      role="option"
                      aria-selected={selectedSeason === year}
                      className={`season-dropdown-item${selectedSeason === year ? " active" : ""}`}
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
                      <div className="results-loading">
                        <div className="results-loading-spinner" />
                        Loading {selectedSeason} results...
                      </div>
                    </td>
                  </tr>
                ) : results.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
                      No results found for {selectedSeason} season.
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
                      <td>
                        <span className={`pos-badge${race.pos === "1" ? " pos-win" : race.pos === "2" || race.pos === "3" ? " pos-podium" : race.pos === "R" ? " pos-dnf" : ""}`}>
                          {race.pos}
                        </span>
                      </td>
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