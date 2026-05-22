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
  // Fetch all data in parallel for performance
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
      {/* Dashboard Header */}
      <div className="page-header" id="dashboard-header">
        <h1>Dashboard – Season Overview</h1>
      </div>

      {/* Next Race Card with Countdown */}
      {nextRace && (
        <NextRaceCard race={nextRace} meeting={matchingMeeting} />
      )}

      {/* Season Info */}
      <div className="season-info" id="season-info">
        <span className="dot" />
        <span>
          Live standings · After round {seasonInfo.round} · Season{" "}
          {seasonInfo.season}
        </span>
      </div>

      {/* Standings Grid */}
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
