import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ScheduleClient from "../ScheduleClient";
import { getSeasonRounds } from "../../lib/api";
import "../schedule.css";
import WavesBackground from "../../components/WavesBackground";

interface PageProps {
  params: Promise<{ season: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { season } = await params;
  return {
    title: `${season} Schedule – F1 Stats Hub`,
    description: `Formula 1 race calendar and full schedule for the ${season} season.`,
  };
}

export default async function ScheduleSeasonPage({ params }: PageProps) {
  const { season } = await params;

  const seasonNum = parseInt(season);
  if (isNaN(seasonNum) || seasonNum < 1950 || seasonNum > new Date().getFullYear()) {
    notFound();
  }

  const races = await getSeasonRounds(season);

  if (races.length === 0) {
    notFound();
  }

  const raceData = races.map((race) => ({
    round: race.round,
    raceName: race.raceName,
    date: race.date,
    time: race.time || "14:00:00Z",
    circuitName: race.Circuit.circuitName,
    country: race.Circuit.Location.country,
    locality: race.Circuit.Location.locality,
  }));

  return (
    <>
      <WavesBackground linecolor="#800000" />
      <div className="page-header" id="schedule-header">
        <h1>Schedule</h1>
      </div>
      <ScheduleClient initialRaces={raceData} initialSeason={season} />
    </>
  );
}
