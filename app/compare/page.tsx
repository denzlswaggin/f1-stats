import type { Metadata } from "next";
import CompareClient from "./CompareClient";
import { getDriverStandings } from "../lib/api";

export const metadata: Metadata = {
  title: "Compare Drivers – F1 Stats Hub",
  description: "Side-by-side comparison of Formula 1 drivers.",
};

export default async function ComparePage() {
  // Fetch active driver list from standings
  const standings = await getDriverStandings(100);

  const drivers = standings.map((s) => ({
    driverId: s.Driver.driverId,
    code: s.Driver.code,
    givenName: s.Driver.givenName,
    familyName: s.Driver.familyName,
    permanentNumber: s.Driver.permanentNumber,
    nationality: s.Driver.nationality,
    team: s.Constructors[0]?.name ?? "",
    constructorId: s.Constructors[0]?.constructorId ?? "",
  }));

  return (
    <>
      <div className="page-header" id="compare-header">
        <h1>Compare Drivers</h1>
      </div>
      <CompareClient drivers={drivers} />
    </>
  );
}
