import type { Metadata } from "next";
import DriverProfileClient from "./DriverProfileClient";
import { getDriverStandings } from "../lib/api";
import './driver.css';

export const metadata: Metadata = {
  title: "Driver Profile – F1 Stats Hub",
  description: "Formula 1 driver profiles and career statistics.",
};

export default async function DriverPage() {
  const standings = await getDriverStandings(22);

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

  return <DriverProfileClient drivers={drivers} />;
}
