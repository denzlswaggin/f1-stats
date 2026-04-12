import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Driver Profile – F1 Stats Hub",
  description: "Formula 1 driver profiles and career statistics.",
};

export default function DriverPage() {
  return (
    <>
      <div className="page-header" id="driver-header">
        <h1>Driver Profile</h1>
      </div>
      <div className="coming-soon">
        <div className="coming-soon-icon">🏎️</div>
        <h2>Coming Soon</h2>
        <p>
          In-depth driver profiles with career stats, race history, and more.
        </p>
      </div>
    </>
  );
}
