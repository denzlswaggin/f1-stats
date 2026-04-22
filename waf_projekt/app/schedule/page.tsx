import type { Metadata } from "next";
import ScheduleClient from "./ScheduleClient";
import { getSeasonSchedule } from "../lib/api";
import "./schedule.css";

export const metadata: Metadata = {
  title: "Schedule – F1 Stats Hub",
  description: "Formula 1 race calendar and full season schedule with session times.",
};

export default async function SchedulePage() {
  const races = await getSeasonSchedule();

  const raceData = races.map((race) => ({
    round: race.round,
    raceName: race.raceName,
    date: race.date,
    time: race.time || "14:00:00Z",
    circuitName: race.Circuit.circuitName,
    country: race.Circuit.Location.country,
    locality: race.Circuit.Location.locality,
  }));

  const season = races.length > 0 ? races[0].season : new Date().getFullYear().toString();

  return (
    <>
      <div className="page-header" id="schedule-header">
        <h1>Schedule</h1>
      </div>
      <ScheduleClient initialRaces={raceData} initialSeason={season} />
    </>
  );
}
