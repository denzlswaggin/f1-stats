"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/schedule", label: "Schedule" },
  { href: "/results", label: "Results" },
  { href: "/driver", label: "Drivers" },
  { href: "/compare", label: "Compare" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav className="navbar" id="main-navbar">
        <Link href="/" className="navbar-logo" id="navbar-logo">
          F1 Stats Hub
        </Link>

        <ul className="navbar-links" id="navbar-links">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={pathname === link.href ? "active" : ""}
                id={`nav-link-${link.label.toLowerCase().replace(/\s/g, "-")}`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <span className="navbar-brand-text">F1 Stats Hub</span>

        <button
          className="mobile-menu-btn"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation menu"
          id="mobile-menu-btn"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </nav>

      {/* Mobile navigation overlay */}
      <div className={`mobile-nav ${mobileOpen ? "open" : ""}`} id="mobile-nav">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={pathname === link.href ? "active" : ""}
            onClick={() => setMobileOpen(false)}
            id={`mobile-nav-link-${link.label.toLowerCase().replace(/\s/g, "-")}`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </>
  );
}
