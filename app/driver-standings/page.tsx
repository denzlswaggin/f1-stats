import { getDriverStandings, getSeasonInfo } from "@/app/lib/api";
import WavesBackground from "../components/WavesBackground";
import StandingsTable from "../components/StandingsTable";

export const metadata = {
  title: "Driver Standings – F1 Stats Hub",
  description: "Current Formula 1 driver standings.",
};

export default async function DriverStandingsPage() {
  const [driverStandings, seasonInfo] = await Promise.all([
    getDriverStandings(100),
    getSeasonInfo(),
  ]);

  return (
    <>
      <WavesBackground linecolor="#800000" />
      <div className="page-header" id="driver-standings-header">
        <h1>Driver Standings</h1>
      </div>

      <div className="season-info" id="season-info">
        <span className="dot" />
        <span>
          Live standings · After round {seasonInfo.round} · Season{" "}
          {seasonInfo.season}
        </span>
      </div>

      <StandingsTable
        type="drivers"
        standings={driverStandings}
        season={seasonInfo.season}
      />
    </>
  );
}
