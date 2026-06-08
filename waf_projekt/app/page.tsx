import {
  getDriverStandings,
  getConstructorStandings,
  getNextRace,
  getSeasonInfo,
  getMeetings,
  findMatchingMeeting,
} from "@/app/lib/api";
import WavesBackground from "./components/WavesBackground";
import NextRaceCard from "./components/NextRaceCard";
import StandingsTable from "./components/StandingsTable";

export default async function DashboardPage() {
  // Fetch all data 
  const [driverStandings, constructorStandings, nextRace, seasonInfo, meetings] =
    await Promise.all([
      getDriverStandings(5),
      getConstructorStandings(5),
      getNextRace(),
      getSeasonInfo(),
      getMeetings(),
    ]);

  // Match the next race with OpenF1 meeting data (for country flag)
  const matchingMeeting = nextRace
    ? findMatchingMeeting(nextRace, meetings)
    : undefined;

  return (
    <>
      <WavesBackground />
      <div className="page-header" id="dashboard-header">
        <h1>Dashboard – Season Overview</h1>
      </div>

      {nextRace && (
        <NextRaceCard race={nextRace} meeting={matchingMeeting} />
      )}

      <div className="season-info" id="season-info">
        <span className="dot" />
        <span>
          Live standings · After round {seasonInfo.round} · Season{" "}
          {seasonInfo.season}
        </span>
      </div>

      <div className="standings-grid">
        <StandingsTable
          type="drivers"
          standings={driverStandings}
          season={seasonInfo.season}
        />
        <StandingsTable
          type="constructors"
          standings={constructorStandings}
          season={seasonInfo.season}
        />
      </div>
    </>
  );
}
