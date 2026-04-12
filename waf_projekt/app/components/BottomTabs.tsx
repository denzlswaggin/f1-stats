"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/*
const TABS = [
  { href: "/", label: "1. Dashboard" },
  { href: "/schedule", label: "2. Schedule" },
  { href: "/results", label: "3. Results" },
  { href: "/driver", label: "4. Driver Profile" },
  { href: "/compare", label: "5. Compare Drivers" },
];

export default function BottomTabs() {
  const pathname = usePathname();

  return (
    <div className="bottom-tabs" id="bottom-tabs">
      {TABS.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`bottom-tab ${pathname === tab.href ? "active" : ""}`}
          id={`tab-${tab.href === "/" ? "dashboard" : tab.href.slice(1)}`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}

*/