"use client";

import { useState, useEffect } from "react";
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
  const [selectedId, setSelectedId] = useState(drivers[0]?.driverId ?? "");
  const [results, setResults] = useState<RaceResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    races: "--",
    wins: "--",
    podiums: "--",
    poles: "--"
  });

  const driver = drivers.find((d) => d.driverId === selectedId) ?? drivers[0];

  useEffect(() => {
    if (!selectedId) return;

    async function fetchData() {
      setIsLoading(true);
      try {
        const statsData = await getDriverCareerStats(selectedId);
        setStats(statsData);

        const races = await getDriverSeasonResults(selectedId);

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
        console.error("Chyba při načítání dat o jezdci:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [selectedId]);

  return (
    <>
      <div className="driver-selector" id="driver-selector">
        <select
          className="driver-select"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          aria-label="Select driver"
        >
          {drivers.map((d) => (
            <option key={d.driverId} value={d.driverId}>
              {d.givenName} {d.familyName} — {d.team}
            </option>
          ))}
        </select>
        <span className="driver-select-chevron">▼</span>
      </div>

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