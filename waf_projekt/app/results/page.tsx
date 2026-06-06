import type { Metadata } from "next";
import ResultsClient from "./ResultsClient";
import { getRaceResults, getSeasonRounds } from "../lib/api";
import "./results.css";
import WavesBackground from "../components/WavesBackground";

export const metadata: Metadata = {
  title: "Race Results – F1 Stats Hub",
  description:
    "Formula 1 race results with detailed finishing order, times, and points.",
};

export default async function ResultsPage() {
  const [racesWithResults, allRounds] = await Promise.all([
    getRaceResults("current", "last"),
    getSeasonRounds("current"),
  ]);

  const race = racesWithResults[0];
  const season = race?.season || new Date().getFullYear().toString();

  // Find last completed round for total rounds calculation
  const now = new Date();
  let lastCompletedRound = allRounds.length;
  for (let i = allRounds.length - 1; i >= 0; i--) {
    const raceDate = new Date(
      `${allRounds[i].date}T${allRounds[i].time || "14:00:00Z"}`
    );
    if (raceDate < now) {
      lastCompletedRound = parseInt(allRounds[i].round);
      break;
    }
  }

  const initialResults = race
    ? race.Results.map((r) => ({
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
    }))
    : [];

  const initialRace = race
    ? {
      round: race.round,
      raceName: race.raceName,
      date: race.date,
      circuitName: race.Circuit.circuitName,
      country: race.Circuit.Location.country,
      locality: race.Circuit.Location.locality,
    }
    : {
      round: "1",
      raceName: "No Data",
      date: "",
      circuitName: "",
      country: "",
      locality: "",
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
        initialSeason={season}
        initialTotalRounds={allRounds.length}
      />
    </>
  );
}
