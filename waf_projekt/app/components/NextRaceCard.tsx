import Countdown from "./Countdown";
import type { Race, OpenF1Meeting } from "@/app/lib/types";

interface NextRaceCardProps {
  race: Race;
  meeting?: OpenF1Meeting;
}

export default function NextRaceCard({ race, meeting }: NextRaceCardProps) {
  const raceDateTime = `${race.date}T${race.time}`;

  // Format the date nicely
  const dateObj = new Date(raceDateTime);
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Format race start time in local timezone
  const formattedTime = dateObj.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

  return (
    <div className="next-race-card" id="next-race-card">
      <div className="next-race-label">Next Race</div>

      {meeting?.country_flag && (
        <div className="next-race-flag">
          {/* Using country flag from OpenF1 API */}
          <img
            src={meeting.country_flag}
            alt={`${race.Circuit.Location.country} flag`}
            width={32}
            height={20}
            style={{ borderRadius: "2px", display: "inline-block" }}
          />
        </div>
      )}

      <h2 className="next-race-name" id="next-race-name">
        🏁 {race.raceName}
      </h2>

      <p className="next-race-circuit">
        {race.Circuit.circuitName} · {formattedDate}
      </p>

      <Countdown targetDate={raceDateTime} />

      <p className="next-race-info">
        <span>Race start: {formattedTime}</span>
        <span className="separator">|</span>
        <span>Round {race.round}</span>
      </p>
    </div>
  );
}
