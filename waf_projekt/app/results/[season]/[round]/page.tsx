import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ResultsClient from "../../ResultsClient";
import { getRaceResults, getSeasonRounds } from "../../../lib/api";
import "../../results.css";
import WavesBackground from "../../../components/WavesBackground";

interface PageProps {
  params: Promise<{ season: string; round: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { season, round } = await params;
  return {
    title: `Round ${round} ${season} Results – F1 Stats Hub`,
    description: `Formula 1 race results for round ${round} of the ${season} season.`,
  };
}

export default async function ResultsDetailPage({ params }: PageProps) {
  const { season, round } = await params;

  // Validate season/round format
  const seasonNum = parseInt(season);
  const roundNum = parseInt(round);
  if (
    isNaN(seasonNum) ||
    isNaN(roundNum) ||
    seasonNum < 1950 ||
    seasonNum > new Date().getFullYear() ||
    roundNum < 1
  ) {
    notFound();
  }

  const [racesWithResults, allRounds] = await Promise.all([
    getRaceResults(season, round),
    getSeasonRounds(season),
  ]);

  const race = racesWithResults[0];

  if (!race) {
    notFound();
  }

  const initialResults = race.Results.map((r) => ({
    position: r.position,
    positionText: r.positionText,
    points: r.points,
    driverName: `${r.Driver.givenName} ${r.Driver.familyName}`,
    driverCode: r.Driver.code,
    driverId: r.Driver.driverId,
    team: r.Constructor.name,
    time: r.Time?.time || "",
    status: r.status,
    laps: r.laps,
    grid: r.grid,
    fastestLap: r.FastestLap?.Time?.time,
  }));

  const initialRace = {
    round: race.round,
    raceName: race.raceName,
    date: race.date,
    circuitName: race.Circuit.circuitName,
    country: race.Circuit.Location.country,
    locality: race.Circuit.Location.locality,
  };

  return (
    <>
      <WavesBackground linecolor="#800000" />
      <div className="page-header" id="results-header">
        <h1>Race Results</h1>
      </div>
      <ResultsClient
        initialResults={initialResults}
        initialRace={initialRace}
        initialSeason={race.season}
        initialTotalRounds={allRounds.length}
      />
    </>
  );
}
