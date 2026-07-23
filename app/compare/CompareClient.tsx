"use client";

import Image from "next/image";
import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import WavesBackground from "../components/WavesBackground";
import { getDriverCareerStats, getDriverSeasonResults } from "../lib/api";
import "./compare.css";

// Country → code for flag display
const countryToCode: Record<string, string> = {
  "Bahrain": "bh", "Saudi Arabia": "sa", "Australia": "au",
  "Japan": "jp", "China": "cn", "USA": "us", "United States": "us",
  "Italy": "it", "Monaco": "mc", "Canada": "ca", "Spain": "es",
  "Austria": "at", "UK": "gb", "Hungary": "hu", "Belgium": "be",
  "Netherlands": "nl", "Singapore": "sg", "Azerbaijan": "az",
  "Qatar": "qa", "Mexico": "mx", "Brazil": "br", "UAE": "ae"
};

// Nationality → code for flag display
const nationalityToCode: Record<string, string> = {
  "Dutch": "nl", "British": "gb", "Monegasque": "mc", "Australian": "au",
  "Spanish": "es", "Mexican": "mx", "Canadian": "ca", "German": "de",
  "French": "fr", "Finnish": "fi", "Japanese": "jp", "Chinese": "cn",
  "Thai": "th", "Danish": "dk", "American": "us", "Italian": "it",
  "Brazilian": "br", "New Zealander": "nz", "Algerian": "dz",
};

// Team colors for hero card background styling
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
  max_verstappen: "/drivers/max_verstappen.avif",
  hadjar: "/drivers/isack_hadjar.avif",
  leclerc: "/drivers/charles_leclerc.avif",
  hamilton: "/drivers/lewis_hamilton.avif",
  norris: "/drivers/lando_norris.avif",
  piastri: "/drivers/oscar_piastri.avif",
  russell: "/drivers/george_russel.avif",
  antonelli: "/drivers/kimi_antonelli.avif",
  alonso: "/drivers/fernando_alonso.avif",
  stroll: "/drivers/lance_stroll.avif",
  gasly: "/drivers/pierre_gasly.avif",
  colapinto: "/drivers/franco_colapinto.avif",
  albon: "/drivers/alexander_albon.avif",
  sainz: "/drivers/carlos_sainz.avif",
  ocon: "/drivers/esteban_ocon.avif",
  bearman: "/drivers/oliver_bearman.avif",
  hulkenberg: "/drivers/nico_hulkenberg.avif",
  bortoleto: "/drivers/gabriel_bortoleto.avif",
  lawson: "/drivers/liam_lawson.avif",
  lindblad: "/drivers/arvid_lindblad.avif",
  perez: "/drivers/sergio_perez.avif",
  bottas: "/drivers/vallteri_bottas.avif",
};

function getDriverPhoto(driverId: string): string {
  return driverPhotos[driverId] || "";
}

export interface DriverInfo {
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

const CURRENT_YEAR = new Date().getFullYear();
const SEASON_OPTIONS = Array.from({ length: CURRENT_YEAR - 1999 }, (_, i) => CURRENT_YEAR - i);

// Highlight matches
const highlightMatch = (text: string, query: string) => {
  if (!query.trim()) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span className="search-highlight" style={{ color: "var(--f1-red)", fontWeight: 700 }}>{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </>
  );
};

function CompareContent({ drivers }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Selected driver IDs from URL parameters
  const [driverAId, setDriverAId] = useState<string | null>(() => searchParams.get("a") || null);
  const [driverBId, setDriverBId] = useState<string | null>(() => searchParams.get("b") || null);

  // Autocomplete search inputs state
  const [queryA, setQueryA] = useState("");
  const [queryB, setQueryB] = useState("");
  const [isOpenA, setIsOpenA] = useState(false);
  const [isOpenB, setIsOpenB] = useState(false);
  const [highlightedIndexA, setHighlightedIndexA] = useState(-1);
  const [highlightedIndexB, setHighlightedIndexB] = useState(-1);

  const searchRefA = useRef<HTMLDivElement>(null);
  const searchRefB = useRef<HTMLDivElement>(null);
  const inputRefA = useRef<HTMLInputElement>(null);
  const inputRefB = useRef<HTMLInputElement>(null);

  // Driver data state
  const [careerStatsA, setCareerStatsA] = useState({ races: "--", wins: "--", podiums: "--", poles: "--" });
  const [careerStatsB, setCareerStatsB] = useState({ races: "--", wins: "--", podiums: "--", poles: "--" });
  const [seasonResultsA, setSeasonResultsA] = useState<any[]>([]);
  const [seasonResultsB, setSeasonResultsB] = useState<any[]>([]);

  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);

  // Selected season state
  const [selectedSeason, setSelectedSeason] = useState<number>(CURRENT_YEAR);
  const [isSeasonOpen, setIsSeasonOpen] = useState(false);
  const seasonRef = useRef<HTMLDivElement>(null);

  // Photo errors
  const [photoErrorA, setPhotoErrorA] = useState(false);
  const [photoErrorB, setPhotoErrorB] = useState(false);

  // Resolve drivers from IDs
  const driverA = driverAId ? drivers.find((d) => d.driverId === driverAId) || null : null;
  const driverB = driverBId ? drivers.find((d) => d.driverId === driverBId) || null : null;

  // Sync state queries with resolved driver names
  useEffect(() => {
    if (driverA) {
      setQueryA(`${driverA.givenName} ${driverA.familyName}`);
    } else {
      setQueryA("");
    }
  }, [driverA]);

  useEffect(() => {
    if (driverB) {
      setQueryB(`${driverB.givenName} ${driverB.familyName}`);
    } else {
      setQueryB("");
    }
  }, [driverB]);

  // Handle URL sync
  const updateUrlParams = useCallback((aId: string | null, bId: string | null) => {
    const params = new URLSearchParams();
    if (aId) params.set("a", aId);
    if (bId) params.set("b", bId);
    router.push(`/compare?${params.toString()}`);
  }, [router]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRefA.current && !searchRefA.current.contains(e.target as Node)) {
        setIsOpenA(false);
      }
      if (searchRefB.current && !searchRefB.current.contains(e.target as Node)) {
        setIsOpenB(false);
      }
      if (seasonRef.current && !seasonRef.current.contains(e.target as Node)) {
        setIsSeasonOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch Driver A stats & season results
  useEffect(() => {
    setPhotoErrorA(false);
    if (!driverAId) {
      setCareerStatsA({ races: "--", wins: "--", podiums: "--", poles: "--" });
      setSeasonResultsA([]);
      return;
    }

    let active = true;
    async function fetchDriverA() {
      setLoadingA(true);
      try {
        const [stats, results] = await Promise.all([
          getDriverCareerStats(driverAId!),
          getDriverSeasonResults(driverAId!, selectedSeason)
        ]);
        if (!active) return;
        setCareerStatsA(stats);
        setSeasonResultsA(results);
      } catch (err) {
        console.error("Error fetching Driver A data:", err);
      } finally {
        if (active) setLoadingA(false);
      }
    }

    fetchDriverA();
    return () => { active = false; };
  }, [driverAId, selectedSeason]);

  // Fetch Driver B stats & season results
  useEffect(() => {
    setPhotoErrorB(false);
    if (!driverBId) {
      setCareerStatsB({ races: "--", wins: "--", podiums: "--", poles: "--" });
      setSeasonResultsB([]);
      return;
    }

    let active = true;
    async function fetchDriverB() {
      setLoadingB(true);
      try {
        const [stats, results] = await Promise.all([
          getDriverCareerStats(driverBId!),
          getDriverSeasonResults(driverBId!, selectedSeason)
        ]);
        if (!active) return;
        setCareerStatsB(stats);
        setSeasonResultsB(results);
      } catch (err) {
        console.error("Error fetching Driver B data:", err);
      } finally {
        if (active) setLoadingB(false);
      }
    }

    fetchDriverB();
    return () => { active = false; };
  }, [driverBId, selectedSeason]);

  // Filter lists based on input queries
  const filteredDriversA = queryA.trim().length === 0
    ? drivers
    : drivers.filter((d) => {
      const fullName = `${d.givenName} ${d.familyName}`.toLowerCase();
      const q = queryA.toLowerCase();
      return fullName.includes(q) || d.code.toLowerCase().includes(q) || d.team.toLowerCase().includes(q) || d.permanentNumber.includes(q);
    });

  const filteredDriversB = queryB.trim().length === 0
    ? drivers
    : drivers.filter((d) => {
      const fullName = `${d.givenName} ${d.familyName}`.toLowerCase();
      const q = queryB.toLowerCase();
      return fullName.includes(q) || d.code.toLowerCase().includes(q) || d.team.toLowerCase().includes(q) || d.permanentNumber.includes(q);
    });


  // Select driver handlers
  const selectDriverA = (id: string) => {
    setDriverAId(id);
    setPhotoErrorA(false);
    setIsOpenA(false);
    updateUrlParams(id, driverBId);
  };

  const selectDriverB = (id: string) => {
    setDriverBId(id);
    setPhotoErrorB(false);
    setIsOpenB(false);
    updateUrlParams(driverAId, id);
  };

  // Helper to draw horizontal ratio comparison bar
  const renderComparisonBar = (valA: string, valB: string, label: string) => {
    const numA = parseInt(valA);
    const numB = parseInt(valB);

    const isLoaded = !isNaN(numA) && !isNaN(numB);
    let pctA = 50;
    let pctB = 50;

    if (isLoaded) {
      const total = numA + numB;
      if (total > 0) {
        pctA = (numA / total) * 100;
        pctB = (numB / total) * 100;
      }
    }

    const leadA = isLoaded && numA > numB;
    const leadB = isLoaded && numB > numA;

    return (
      <div className="compare-metric-row">
        <div className="compare-metric-info">
          <span className={`compare-value-left ${leadA ? "compare-winner-highlight" : ""}`}>
            {valA} {leadA && "🏆"}
          </span>
          <span className="compare-metric-title">{label}</span>
          <span className={`compare-value-right ${leadB ? "compare-winner-highlight" : ""}`}>
            {leadB && "🏆"} {valB}
          </span>
        </div>
        <div className="compare-bar-container">
          <div
            className="compare-bar-fill-left"
            style={{
              width: `${pctA}%`,
              "--left-color": driverA ? getTeamColors(driverA.constructorId).primary : "var(--f1-red)"
            } as React.CSSProperties}
          />
          <div className="compare-bar-divider" />
          <div
            className="compare-bar-fill-right"
            style={{
              width: `${pctB}%`,
              "--right-color": driverB ? getTeamColors(driverB.constructorId).primary : "var(--f1-red)"
            } as React.CSSProperties}
          />
        </div>
      </div>
    );
  };

  // Calculate Head-to-Head Season Performance Metrics
  const calculateSeasonStats = () => {
    if (!driverAId || !driverBId) return null;

    let ptsA = 0;
    let ptsB = 0;
    let finishesA: number[] = [];
    let finishesB: number[] = [];
    let h2hWinA = 0;
    let h2hWinB = 0;

    // Sum Points
    seasonResultsA.forEach((r) => {
      if (r.Results?.[0]?.points) {
        ptsA += parseFloat(r.Results[0].points);
      }
      if (r.Results?.[0]?.positionText) {
        const num = parseInt(r.Results[0].positionText);
        if (!isNaN(num)) finishesA.push(num);
      }
    });

    seasonResultsB.forEach((r) => {
      if (r.Results?.[0]?.points) {
        ptsB += parseFloat(r.Results[0].points);
      }
      if (r.Results?.[0]?.positionText) {
        const num = parseInt(r.Results[0].positionText);
        if (!isNaN(num)) finishesB.push(num);
      }
    });

    // Best finishes
    const bestA = finishesA.length > 0 ? Math.min(...finishesA) : "--";
    const bestB = finishesB.length > 0 ? Math.min(...finishesB) : "--";

    // Average finish position
    const avgA = finishesA.length > 0 ? (finishesA.reduce((a, b) => a + b, 0) / finishesA.length).toFixed(1) : "--";
    const avgB = finishesB.length > 0 ? (finishesB.reduce((a, b) => a + b, 0) / finishesB.length).toFixed(1) : "--";

    // Dynamic H2H Race finish comparison
    // Align results by round/GP name
    const allRounds = Array.from(new Set([
      ...seasonResultsA.map(r => r.round),
      ...seasonResultsB.map(r => r.round)
    ])).sort((x, y) => parseInt(x) - parseInt(y));

    allRounds.forEach((round) => {
      const raceA = seasonResultsA.find(r => r.round === round);
      const raceB = seasonResultsB.find(r => r.round === round);

      if (raceA && raceB) {
        const posTextA = raceA.Results[0].positionText;
        const posTextB = raceB.Results[0].positionText;
        const numA = parseInt(posTextA);
        const numB = parseInt(posTextB);

        if (!isNaN(numA) && !isNaN(numB)) {
          if (numA < numB) h2hWinA++;
          else if (numB < numA) h2hWinB++;
        } else if (!isNaN(numA) && isNaN(numB)) {
          h2hWinA++; // A finished, B DNF
        } else if (isNaN(numA) && !isNaN(numB)) {
          h2hWinB++; // B finished, A DNF
        }
      }
    });

    return {
      ptsA: ptsA.toString(),
      ptsB: ptsB.toString(),
      avgA,
      avgB,
      bestA: bestA.toString(),
      bestB: bestB.toString(),
      h2hWinA,
      h2hWinB,
      allRounds
    };
  };

  const seasonStats = calculateSeasonStats();

  // Combine results into unified comparison list
  const getComparisonTableRows = () => {
    if (!seasonStats || !driverAId || !driverBId) return [];

    return seasonStats.allRounds.map((round) => {
      const raceA = seasonResultsA.find(r => r.round === round);
      const raceB = seasonResultsB.find(r => r.round === round);

      const gpName = raceA?.raceName || raceB?.raceName || `Round ${round}`;
      const country = raceA?.Circuit?.Location?.country || raceB?.Circuit?.Location?.country || "un";
      const countryCode = countryToCode[country] || "un";
      const flagUrl = `https://flagcdn.com/24x18/${countryCode}.png`;

      const posAText = raceA?.Results?.[0]?.positionText ?? "--";
      const posBText = raceB?.Results?.[0]?.positionText ?? "--";

      const numA = parseInt(posAText);
      const numB = parseInt(posBText);

      // Determine who won this specific round
      let winLeft = false;
      let winRight = false;

      if (!isNaN(numA) && !isNaN(numB)) {
        if (numA < numB) winLeft = true;
        else if (numB < numA) winRight = true;
      } else if (!isNaN(numA) && isNaN(numB) && posBText !== "--") {
        winLeft = true; // A finished, B DNF
      } else if (isNaN(numA) && !isNaN(numB) && posAText !== "--") {
        winRight = true; // B finished, A DNF
      }

      return {
        round,
        gpName,
        flagUrl,
        posA: posAText,
        posB: posBText,
        winLeft,
        winRight
      };
    });
  };

  const comparisonTableRows = getComparisonTableRows();

  return (
    <div className="compare-page-wrapper">
      <WavesBackground linecolor="#800000" />

      {/* Autocomplete Selectors */}
      <div className="compare-selector-grid">
        {/* Driver A Selector */}
        <div className="compare-selector-col" ref={searchRefA}>
          <label className="compare-label" htmlFor="driver-a-input">
            <span className="compare-label-indicator" style={{ "--theme-color": driverA ? getTeamColors(driverA.constructorId).primary : "var(--f1-red)" } as React.CSSProperties} />
            Driver A
          </label>
          <div className="compare-search-container">
            <div className="compare-search-input-wrapper">
              <svg className="compare-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                id="driver-a-input"
                ref={inputRefA}
                type="text"
                className="compare-search-input"
                placeholder="Select Driver A..."
                value={queryA}
                onChange={(e) => { setQueryA(e.target.value); setIsOpenA(true); }}
                onFocus={() => setIsOpenA(true)}
                autoComplete="off"
                style={{ "--theme-color": driverA ? getTeamColors(driverA.constructorId).primary : "var(--f1-red)" } as React.CSSProperties}
              />
              {queryA && (
                <button
                  className="compare-search-clear"
                  onClick={() => { setQueryA(""); setDriverAId(null); updateUrlParams(null, driverBId); setIsOpenA(true); inputRefA.current?.focus(); }}
                  type="button"
                  style={{ "--theme-color": driverA ? getTeamColors(driverA.constructorId).primary : "var(--f1-red)" } as React.CSSProperties}
                >✕</button>
              )}
            </div>
            {isOpenA && (
              <ul className="compare-search-dropdown" role="listbox">
                {filteredDriversA.length === 0 ? (
                  <li className="compare-search-empty">No drivers found</li>
                ) : (
                  filteredDriversA.map((d, idx) => (
                    <li
                      key={d.driverId}
                      role="option"
                      aria-selected={highlightedIndexA === idx}
                      className={`compare-search-item ${highlightedIndexA === idx ? "highlighted" : ""} ${d.driverId === driverAId ? "selected" : ""}`}
                      onMouseEnter={() => setHighlightedIndexA(idx)}
                      onClick={() => selectDriverA(d.driverId)}
                      style={{ "--theme-color": getTeamColors(d.constructorId).primary } as React.CSSProperties}
                    >
                      <span className="compare-search-number">{d.permanentNumber}</span>
                      <span className="compare-search-name">{highlightMatch(`${d.givenName} ${d.familyName}`, queryA)}</span>
                      <span className="compare-search-team">{highlightMatch(d.team, queryA)}</span>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
        </div>

        {/* Driver B Selector */}
        <div className="compare-selector-col" ref={searchRefB}>
          <label className="compare-label" htmlFor="driver-b-input">
            <span className="compare-label-indicator" style={{ "--theme-color": driverB ? getTeamColors(driverB.constructorId).primary : "var(--f1-red)" } as React.CSSProperties} />
            Driver B
          </label>
          <div className="compare-search-container">
            <div className="compare-search-input-wrapper">
              <svg className="compare-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                id="driver-b-input"
                ref={inputRefB}
                type="text"
                className="compare-search-input"
                placeholder="Select Driver B..."
                value={queryB}
                onChange={(e) => { setQueryB(e.target.value); setIsOpenB(true); }}
                onFocus={() => setIsOpenB(true)}
                autoComplete="off"
                style={{ "--theme-color": driverB ? getTeamColors(driverB.constructorId).primary : "var(--f1-red)" } as React.CSSProperties}
              />
              {queryB && (
                <button
                  className="compare-search-clear"
                  onClick={() => { setQueryB(""); setDriverBId(null); updateUrlParams(driverAId, null); setIsOpenB(true); inputRefB.current?.focus(); }}
                  type="button"
                  style={{ "--theme-color": driverB ? getTeamColors(driverB.constructorId).primary : "var(--f1-red)" } as React.CSSProperties}
                >✕</button>
              )}
            </div>
            {isOpenB && (
              <ul className="compare-search-dropdown" role="listbox">
                {filteredDriversB.length === 0 ? (
                  <li className="compare-search-empty">No drivers found</li>
                ) : (
                  filteredDriversB.map((d, idx) => (
                    <li
                      key={d.driverId}
                      role="option"
                      aria-selected={highlightedIndexB === idx}
                      className={`compare-search-item ${highlightedIndexB === idx ? "highlighted" : ""} ${d.driverId === driverBId ? "selected" : ""}`}
                      onMouseEnter={() => setHighlightedIndexB(idx)}
                      onClick={() => selectDriverB(d.driverId)}
                      style={{ "--theme-color": getTeamColors(d.constructorId).primary } as React.CSSProperties}
                    >
                      <span className="compare-search-number">{d.permanentNumber}</span>
                      <span className="compare-search-name">{highlightMatch(`${d.givenName} ${d.familyName}`, queryB)}</span>
                      <span className="compare-search-team">{highlightMatch(d.team, queryB)}</span>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Side-by-Side Hero Cards */}
      <CompareHeroCards
        driverA={driverA}
        driverB={driverB}
        photoErrorA={photoErrorA}
        photoErrorB={photoErrorB}
        setPhotoErrorA={setPhotoErrorA}
        setPhotoErrorB={setPhotoErrorB}
        inputRefA={inputRefA}
        inputRefB={inputRefB}
      />

      {/* Main Comparisons Content */}
      {driverA && driverB ? (
        <>
          {/* Career comparison section */}
          <div className="compare-section-header">Career Stats Comparison</div>

          <div className="compare-career-grid">
            {loadingA || loadingB ? (
              <div className="compare-loading-wrapper">
                <div className="compare-spinner" />
                <span>Comparing career history...</span>
              </div>
            ) : (
              <>
                {renderComparisonBar(careerStatsA.races, careerStatsB.races, "Grand Prix Entries")}
                {renderComparisonBar(careerStatsA.wins, careerStatsB.wins, "Career Wins")}
                {renderComparisonBar(careerStatsA.podiums, careerStatsB.podiums, "Podium Finishes")}
                {renderComparisonBar(careerStatsA.poles, careerStatsB.poles, "Pole Positions")}
              </>
            )}
          </div>

          {/* Season comparison section with season selector */}
          <div className="compare-season-header" ref={seasonRef}>
            <h2>Season Performance Comparison</h2>
            <div className="season-selector" style={{ zIndex: 10 }}>
              <button className="season-selector-btn" onClick={() => setIsSeasonOpen(!isSeasonOpen)} aria-label="Select season" type="button">
                {selectedSeason} Season
                <svg className={`season-chevron ${isSeasonOpen ? "open" : ""}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
                      className={`season-dropdown-item ${selectedSeason === year ? "active" : ""}`}
                      onClick={() => { setSelectedSeason(year); setIsSeasonOpen(false); }}
                    >
                      {year}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {loadingA || loadingB ? (
            <div className="compare-loading-wrapper" style={{ background: "var(--bg-card)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-color)", marginBottom: "40px" }}>
              <div className="compare-spinner" />
              <span>Fetching {selectedSeason} season metrics...</span>
            </div>
          ) : seasonStats ? (
            <CompareSeasonSection
              seasonStats={seasonStats}
              selectedSeason={selectedSeason}
              driverA={driverA}
              driverB={driverB}
              comparisonTableRows={comparisonTableRows}
            />
          ) : (
            <div className="compare-empty-state-notice">
              <h3>Stats Unavailable</h3>
              <p>Could not fetch comparison metrics for the selected season. Please try a different season.</p>
            </div>
          )}
        </>
      ) : (
        <div className="compare-empty-state-notice">
          <h3>Compare Drivers</h3>
          <p>Please select two Formula 1 drivers above to begin head-to-head career and season comparison.</p>
        </div>
      )}
    </div>
  );
}

/* ─── Hero Cards Subcomponent ─── */

function CompareHeroCards({ driverA, driverB, photoErrorA, photoErrorB, setPhotoErrorA, setPhotoErrorB, inputRefA, inputRefB }: {
  driverA: DriverInfo | null; driverB: DriverInfo | null;
  photoErrorA: boolean; photoErrorB: boolean;
  setPhotoErrorA: (v: boolean) => void; setPhotoErrorB: (v: boolean) => void;
  inputRefA: React.RefObject<HTMLInputElement | null>; inputRefB: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <div className="compare-heroes-container">
      {driverA ? (
        <div className="compare-driver-card" style={{ "--team-primary": getTeamColors(driverA.constructorId).primary, "--team-dark": getTeamColors(driverA.constructorId).dark, "--team-accent": getTeamColors(driverA.constructorId).accent } as React.CSSProperties}>
          <div className="compare-hero-watermark">{driverA.permanentNumber}</div>
          <div className="compare-hero-stripes"><div className="stripe" /><div className="stripe" /></div>
          <div className="compare-hero-content">
            <h2 className="compare-hero-name">
              <span className="compare-hero-given">{driverA.givenName}</span>
              <span className="compare-hero-family">{driverA.familyName}</span>
            </h2>
            <div className="compare-hero-meta">
              <span className="compare-hero-meta-item">
                <Image width={500} height={500} src={`https://flagcdn.com/16x12/${nationalityToCode[driverA.nationality] || "un"}.png`} alt={driverA.nationality} className="compare-hero-flag" />
                {driverA.nationality}
              </span>
              <span className="compare-hero-meta-sep">|</span>
              <span className="compare-hero-meta-item">{driverA.team}</span>
            </div>
          </div>
          <div className="compare-hero-photo">
            {!photoErrorA && getDriverPhoto(driverA.driverId) ? (
              <Image width={500} height={500} src={getDriverPhoto(driverA.driverId)} alt={driverA.familyName} className="compare-hero-photo-img" onError={() => setPhotoErrorA(true)} />
            ) : (
              <div className="compare-hero-photo-fallback">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              </div>
            )}
          </div>
        </div>
      ) : (
        <button type="button" className="compare-driver-card-empty" onClick={() => inputRefA.current?.focus()}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
          Select Driver A
        </button>
      )}

      {driverB ? (
        <div className="compare-driver-card" style={{ "--team-primary": getTeamColors(driverB.constructorId).primary, "--team-dark": getTeamColors(driverB.constructorId).dark, "--team-accent": getTeamColors(driverB.constructorId).accent } as React.CSSProperties}>
          <div className="compare-hero-watermark">{driverB.permanentNumber}</div>
          <div className="compare-hero-stripes"><div className="stripe" /><div className="stripe" /></div>
          <div className="compare-hero-content">
            <h2 className="compare-hero-name">
              <span className="compare-hero-given">{driverB.givenName}</span>
              <span className="compare-hero-family">{driverB.familyName}</span>
            </h2>
            <div className="compare-hero-meta">
              <span className="compare-hero-meta-item">
                <Image width={500} height={500} src={`https://flagcdn.com/16x12/${nationalityToCode[driverB.nationality] || "un"}.png`} alt={driverB.nationality} className="compare-hero-flag" />
                {driverB.nationality}
              </span>
              <span className="compare-hero-meta-sep">|</span>
              <span className="compare-hero-meta-item">{driverB.team}</span>
            </div>
          </div>
          <div className="compare-hero-photo">
            {!photoErrorB && getDriverPhoto(driverB.driverId) ? (
              <Image width={500} height={500} src={getDriverPhoto(driverB.driverId)} alt={driverB.familyName} className="compare-hero-photo-img" onError={() => setPhotoErrorB(true)} />
            ) : (
              <div className="compare-hero-photo-fallback">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              </div>
            )}
          </div>
        </div>
      ) : (
        <button type="button" className="compare-driver-card-empty" onClick={() => inputRefB.current?.focus()}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
          Select Driver B
        </button>
      )}
    </div>
  );
}

/* ─── Season Stats + Results Table Subcomponent ─── */

function CompareSeasonSection({ seasonStats, selectedSeason, driverA, driverB, comparisonTableRows }: {
  seasonStats: { ptsA: string; ptsB: string; avgA: string; avgB: string; bestA: string; bestB: string; h2hWinA: number; h2hWinB: number; };
  selectedSeason: number; driverA: DriverInfo; driverB: DriverInfo;
  comparisonTableRows: { round: string; gpName: string; flagUrl: string; posA: string; posB: string; winLeft: boolean; winRight: boolean; }[];
}) {
  const colorsA = getTeamColors(driverA.constructorId);
  const colorsB = getTeamColors(driverB.constructorId);

  return (
    <>
      <div className="compare-season-cards">
        <div className="compare-stat-card">
          <span className="compare-stat-label">Season Points</span>
          <div className="compare-stat-values-row">
            <span className={`compare-stat-card-val left-val ${parseFloat(seasonStats.ptsA) > parseFloat(seasonStats.ptsB) ? "stat-lead" : ""}`} style={{ "--left-color": colorsA.primary, "--lead-color": colorsA.primary } as React.CSSProperties}>{seasonStats.ptsA}</span>
            <span className="compare-stat-card-vs">vs</span>
            <span className={`compare-stat-card-val right-val ${parseFloat(seasonStats.ptsB) > parseFloat(seasonStats.ptsA) ? "stat-lead" : ""}`} style={{ "--right-color": colorsB.primary, "--lead-color": colorsB.primary } as React.CSSProperties}>{seasonStats.ptsB}</span>
          </div>
        </div>

        <div className="compare-stat-card">
          <span className="compare-stat-label">Avg. Finish Position</span>
          <div className="compare-stat-values-row">
            <span className={`compare-stat-card-val left-val ${seasonStats.avgA !== "--" && (seasonStats.avgB === "--" || parseFloat(seasonStats.avgA) < parseFloat(seasonStats.avgB)) ? "stat-lead" : ""}`} style={{ "--left-color": colorsA.primary, "--lead-color": colorsA.primary } as React.CSSProperties}>{seasonStats.avgA}</span>
            <span className="compare-stat-card-vs">vs</span>
            <span className={`compare-stat-card-val right-val ${seasonStats.avgB !== "--" && (seasonStats.avgA === "--" || parseFloat(seasonStats.avgB) < parseFloat(seasonStats.avgA)) ? "stat-lead" : ""}`} style={{ "--right-color": colorsB.primary, "--lead-color": colorsB.primary } as React.CSSProperties}>{seasonStats.avgB}</span>
          </div>
        </div>

        <div className="compare-stat-card">
          <span className="compare-stat-label">Best Finish</span>
          <div className="compare-stat-values-row">
            <span className={`compare-stat-card-val left-val ${seasonStats.bestA !== "--" && (seasonStats.bestB === "--" || parseInt(seasonStats.bestA) < parseInt(seasonStats.bestB)) ? "stat-lead" : ""}`} style={{ "--left-color": colorsA.primary, "--lead-color": colorsA.primary } as React.CSSProperties}>{seasonStats.bestA}</span>
            <span className="compare-stat-card-vs">vs</span>
            <span className={`compare-stat-card-val right-val ${seasonStats.bestB !== "--" && (seasonStats.bestA === "--" || parseInt(seasonStats.bestB) < parseInt(seasonStats.bestA)) ? "stat-lead" : ""}`} style={{ "--right-color": colorsB.primary, "--lead-color": colorsB.primary } as React.CSSProperties}>{seasonStats.bestB}</span>
          </div>
        </div>

        <div className="compare-stat-card">
          <span className="compare-stat-label">H2H Finish Record</span>
          <div className="compare-stat-values-row">
            <span className={`compare-stat-card-val left-val ${seasonStats.h2hWinA > seasonStats.h2hWinB ? "stat-lead" : ""}`} style={{ "--left-color": colorsA.primary, "--lead-color": colorsA.primary } as React.CSSProperties}>{seasonStats.h2hWinA}</span>
            <span className="compare-stat-card-vs">vs</span>
            <span className={`compare-stat-card-val right-val ${seasonStats.h2hWinB > seasonStats.h2hWinA ? "stat-lead" : ""}`} style={{ "--right-color": colorsB.primary, "--lead-color": colorsB.primary } as React.CSSProperties}>{seasonStats.h2hWinB}</span>
          </div>
          {(() => {
            const total = seasonStats.h2hWinA + seasonStats.h2hWinB;
            const fillA = total > 0 ? (seasonStats.h2hWinA / total) * 100 : 50;
            const fillB = total > 0 ? (seasonStats.h2hWinB / total) * 100 : 50;
            return (
              <div className="compare-h2h-split-bar">
                <div className="compare-h2h-left-fill" style={{ width: `${fillA}%`, "--left-color": colorsA.primary } as React.CSSProperties} />
                <div className="compare-h2h-right-fill" style={{ width: `${fillB}%`, "--right-color": colorsB.primary } as React.CSSProperties} />
              </div>
            );
          })()}
        </div>
      </div>

      <div className="compare-section-header">{selectedSeason} Season Race-by-Race Comparison</div>

      <div className="compare-table-wrapper">
        <table className="compare-results-table">
          <thead>
            <tr>
              <th className="compare-cell-round">Round</th>
              <th className="compare-cell-gp">Grand Prix</th>
              <th className="compare-cell-driver-a" style={{ color: colorsA.primary }}>{driverA.familyName}</th>
              <th className="compare-cell-vs-divider">VS</th>
              <th className="compare-cell-driver-b" style={{ color: colorsB.primary }}>{driverB.familyName}</th>
            </tr>
          </thead>
          <tbody>
            {comparisonTableRows.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>No races found for the {selectedSeason} season.</td></tr>
            ) : (
              comparisonTableRows.map((row) => (
                <tr key={row.round} className={`${row.winLeft ? "compare-row-win-left" : ""} ${row.winRight ? "compare-row-win-right" : ""}`} style={{ "--left-color": colorsA.primary, "--right-color": colorsB.primary } as React.CSSProperties}>
                  <td className="compare-cell-round">{row.round.padStart(2, "0")}</td>
                  <td><div className="gp-cell"><Image width={500} height={500} src={row.flagUrl} alt="Country flag" className="gp-flag" loading="lazy" /><span className="compare-cell-gp">{row.gpName}</span></div></td>
                  <td className="compare-cell-driver-a"><span className={`compare-badge ${row.winLeft ? "compare-badge-win-lead" : ""} ${row.posA === "1" ? "pos-win" : row.posA === "2" || row.posA === "3" ? "pos-podium" : row.posA === "R" || row.posA === "D" ? "pos-dnf" : ""}`} style={{ "--team-color": colorsA.primary } as React.CSSProperties}>{row.posA}</span></td>
                  <td className="compare-cell-vs-divider">:</td>
                  <td className="compare-cell-driver-b"><span className={`compare-badge ${row.winRight ? "compare-badge-win-lead" : ""} ${row.posB === "1" ? "pos-win" : row.posB === "2" || row.posB === "3" ? "pos-podium" : row.posB === "R" || row.posB === "D" ? "pos-dnf" : ""}`} style={{ "--team-color": colorsB.primary } as React.CSSProperties}>{row.posB}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function CompareClient({ drivers }: Props) {
  return (
    <Suspense fallback={
      <div className="compare-loading-wrapper">
        <div className="compare-spinner" />
        <span>Loading comparison engine...</span>
      </div>
    }>
      <CompareContent drivers={drivers} />
    </Suspense>
  );
}
