"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";

const NAV_LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/schedule", label: "Schedule" },
  { href: "/results", label: "Results" },
  { href: "/driver", label: "Drivers" },
  { href: "/compare", label: "Compare" },
  { href: "/packs", label: "Packs" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Resolve current page label (match prefix for dynamic routes)
  const currentLabel =
    NAV_LINKS.find((l) =>
      l.href === "/" ? pathname === "/" : pathname.startsWith(l.href)
    )?.label ?? "Menu";

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-dropdown-wrapper" ref={dropdownRef}>
        <button
          className={`navbar-logo${open ? " open" : ""}`}
          id="navbar-logo"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-haspopup="true"
        >
          {/* Logo placeholder – F1 car icon */}
          <svg
            className="navbar-logo-icon"
            width="22"
            height="14"
            viewBox="0 0 22 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M1 9.5 C1 7 3.5 5 6.5 5 L10 4.5 L13.5 3 L18.5 3.5 L20.5 5.5 L19 7 L15.5 8 L10 9 L5.5 9.5 Z"
              fill="currentColor"
              opacity="0.9"
            />
            <circle cx="5" cy="11" r="2" fill="currentColor" opacity="0.7" />
            <circle cx="5" cy="11" r="1" fill="var(--f1-red)" />
            <circle cx="16" cy="10.5" r="2" fill="currentColor" opacity="0.7" />
            <circle cx="16" cy="10.5" r="1" fill="var(--f1-red)" />
          </svg>

          <div className="navbar-logo-text">
            <span className="navbar-logo-brand">F1 Stats Hub</span>
            <span className="navbar-logo-page">{currentLabel}</span>
          </div>

          <svg
            className={`navbar-chevron${open ? " open" : ""}`}
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 4.5L6 7.5L9 4.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div
          className={`navbar-dropdown${open ? " open" : ""}`}
          id="navbar-dropdown"
          role="menu"
        >
          {NAV_LINKS.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                role="menuitem"
                className={`navbar-dropdown-item${isActive ? " active" : ""}`}
                id={`nav-link-${link.label.toLowerCase().replace(/\s/g, "-")}`}
                onClick={() => setOpen(false)}
              >
                {link.label}
                {isActive && <span className="navbar-dropdown-item-dot" aria-hidden="true" />}
              </Link>
            );
          })}
        </div>
      </div>

      <span className="navbar-brand-text" aria-hidden="true">F1 Stats Hub</span>
    </nav>
  );
}