"use client";

import { useState } from "react";

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

export default function DriverProfileClient({ drivers }: Props) {
  const [selectedId, setSelectedId] = useState(drivers[0]?.driverId ?? "");
  const driver = drivers.find((d) => d.driverId === selectedId) ?? drivers[0];

  // Placeholder data atm
  const placeholderResults = [
    { round: "01", gp: "BAHRAIN GP", pos: "1", pts: "25" },
    { round: "02", gp: "SAUDI ARABIAN GP", pos: "2", pts: "18" },
    { round: "03", gp: "AUSTRALIAN GP", pos: "3", pts: "15" },
    { round: "04", gp: "JAPANESE GP", pos: "1", pts: "25" },
    { round: "05", gp: "CHINESE GP", pos: "12", pts: "0" },
  ];

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
              <span className="driver-stat-value">332</span>
              <span className="driver-stat-label">Races</span>
            </div>
            <div className="driver-stat-card">
              <span className="driver-stat-value">102</span>
              <span className="driver-stat-label">Wins</span>
            </div>
            <div className="driver-stat-card">
              <span className="driver-stat-value">197</span>
              <span className="driver-stat-label">Podiums</span>
            </div>
            <div className="driver-stat-card">
              <span className="driver-stat-value">104</span>
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
                {placeholderResults.map((race, index) => (
                  <tr key={index}>
                    <td>{race.round}</td>
                    <td>
                      <div className="gp-cell">
                        <div className="gp-flag-placeholder"></div>
                        <span>{race.gp}</span>
                      </div>
                    </td>
                    <td>{race.pos}</td>
                    <td>{race.pts}</td>
                  </tr>
                ))}
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