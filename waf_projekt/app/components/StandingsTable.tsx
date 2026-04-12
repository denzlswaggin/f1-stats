import type { DriverStanding, ConstructorStanding } from "@/app/lib/types";

interface DriverStandingsTableProps {
  type: "drivers";
  standings: DriverStanding[];
  season: string;
}

interface ConstructorStandingsTableProps {
  type: "constructors";
  standings: ConstructorStanding[];
  season: string;
}

type StandingsTableProps =
  | DriverStandingsTableProps
  | ConstructorStandingsTableProps;

export default function StandingsTable(props: StandingsTableProps) {
  const { type, season } = props;

  const title =
    type === "drivers"
      ? `Driver Standings – ${season}`
      : `Constructor Standings`;

  return (
    <div className="standings-section" id={`${type}-standings`}>
      <div className="standings-header">{title}</div>

      <table className="standings-table">
        <thead>
          <tr>
            <th>#</th>
            {type === "drivers" ? (
              <>
                <th>Driver</th>
                <th>Team</th>
              </>
            ) : (
              <th>Team</th>
            )}
            <th>PTS</th>
          </tr>
        </thead>
        <tbody>
          {type === "drivers"
            ? (props as DriverStandingsTableProps).standings.map(
                (standing) => (
                  <tr key={standing.Driver.driverId}>
                    <td>{standing.position}</td>
                    <td className="driver-name">
                      {standing.Driver.givenName}{" "}
                      {standing.Driver.familyName}
                    </td>
                    <td className="team-name">
                      {standing.Constructors[0]?.name || "–"}
                    </td>
                    <td>{standing.points}</td>
                  </tr>
                )
              )
            : (props as ConstructorStandingsTableProps).standings.map(
                (standing) => (
                  <tr key={standing.Constructor.constructorId}>
                    <td>{standing.position}</td>
                    <td className="driver-name">
                      {standing.Constructor.name}
                    </td>
                    <td>{standing.points}</td>
                  </tr>
                )
              )}
        </tbody>
      </table>
    </div>
  );
}
