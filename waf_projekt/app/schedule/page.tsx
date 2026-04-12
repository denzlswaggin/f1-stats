import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Schedule – F1 Stats Hub",
  description: "Formula 1 2026 race calendar and schedule.",
};

export default function SchedulePage() {
  return (
    <>
      <div className="page-header" id="schedule-header">
        <h1>Schedule – Race Calendar</h1>
      </div>
      <div className="coming-soon">
        <div className="coming-soon-icon">📅</div>
        <h2>Coming Soon</h2>
        <p>Full race calendar with session times will be available here.</p>
      </div>
    </>
  );
}
