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

  return (
    <>
      {/* Page header */}
      <div className="page-header" id="driver-header">
        <h1>Driver info</h1>
      </div>

      {/* Driver selector */}
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

      {/* Driver hero card */}
      {driver && (
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
      )}
    </>
  );
}
