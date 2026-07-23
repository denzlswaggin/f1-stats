import { getConstructorStandings, getSeasonInfo } from "@/app/lib/api";
import WavesBackground from "../components/WavesBackground";
import StandingsTable from "../components/StandingsTable";

export const metadata = {
  title: "Constructor Standings – F1 Stats Hub",
  description: "Current Formula 1 constructor standings.",
};

export default async function ConstructorStandingsPage() {
  const [constructorStandings, seasonInfo] = await Promise.all([
    getConstructorStandings(100),
    getSeasonInfo(),
  ]);

  return (
    <>
      <WavesBackground linecolor="#800000" />
      <div className="page-header" id="constructor-standings-header">
        <h1>Constructor Standings</h1>
      </div>

      <div className="season-info" id="season-info">
        <span className="dot" />
        <span>
          Live standings · After round {seasonInfo.round} · Season{" "}
          {seasonInfo.season}
        </span>
      </div>

      <StandingsTable
        type="constructors"
        standings={constructorStandings}
        season={seasonInfo.season}
      />
    </>
  );
}
