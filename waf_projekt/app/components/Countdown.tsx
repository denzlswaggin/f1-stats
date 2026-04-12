"use client";

import { useState, useEffect } from "react";

interface CountdownProps {
  targetDate: string; // ISO date string
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(targetDate: string): TimeLeft {
  const difference = new Date(targetDate).getTime() - new Date().getTime();

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

function padZero(num: number): string {
  return num.toString().padStart(2, "0");
}

export default function Countdown({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(
    calculateTimeLeft(targetDate)
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTimeLeft(calculateTimeLeft(targetDate));

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!mounted) {
    return (
      <div className="countdown" id="countdown-timer">
        {["DAYS", "HOURS", "MINS", "SECS"].map((label) => (
          <div className="countdown-unit" key={label}>
            <span className="countdown-value">--</span>
            <span className="countdown-label">{label}</span>
          </div>
        ))}
      </div>
    );
  }

  const units: { value: number; label: string }[] = [
    { value: timeLeft.days, label: "DAYS" },
    { value: timeLeft.hours, label: "HOURS" },
    { value: timeLeft.minutes, label: "MINS" },
    { value: timeLeft.seconds, label: "SECS" },
  ];

  return (
    <div className="countdown" id="countdown-timer">
      {units.map((unit) => (
        <div className="countdown-unit" key={unit.label}>
          <span className="countdown-value">{padZero(unit.value)}</span>
          <span className="countdown-label">{unit.label}</span>
        </div>
      ))}
    </div>
  );
}
