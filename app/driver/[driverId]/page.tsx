import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DriverProfileClient from "../DriverProfileClient";
import { getDriverStandings } from "../../lib/api";
import "../driver.css";

interface PageProps {
  params: Promise<{ driverId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { driverId } = await params;
  const standings = await getDriverStandings(22);
  const match = standings.find((s) => s.Driver.driverId === driverId);

  if (!match) {
    return { title: "Driver Not Found – F1 Stats Hub" };
  }

  const name = `${match.Driver.givenName} ${match.Driver.familyName}`;
  return {
    title: `${name} – F1 Stats Hub`,
    description: `Formula 1 profile and career statistics for ${name}, currently driving for ${match.Constructors[0]?.name}.`,
  };
}

export default async function DriverDetailPage({ params }: PageProps) {
  const { driverId } = await params;

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

  // Validate the driverId exists
  const driverExists = drivers.some((d) => d.driverId === driverId);
  if (!driverExists) {
    notFound();
  }

  return <DriverProfileClient drivers={drivers} initialDriverId={driverId} />;
}
