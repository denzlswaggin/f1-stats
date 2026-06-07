"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";

import { logoutUser } from "@/app/actions/auth";

const NAV_LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/schedule", label: "Schedule" },
  { href: "/results", label: "Results" },
  { href: "/driver-standings", label: "Driver Standings" },
  { href: "/constructor-standings", label: "Constructor Standings" },
  { href: "/driver", label: "Drivers" },
  { href: "/compare", label: "Compare" },
];



export default function Navbar({ user }: { user?: { name?: string | null; email?: string | null; image?: string | null } }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Resolve current page label (match prefix for dynamic routes)
  const currentLabel =
    NAV_LINKS.find((l) =>
      l.href === "/" ? pathname === "/" : (pathname === l.href || pathname.startsWith(`${l.href}/`))
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
                : (pathname === link.href || pathname.startsWith(`${link.href}/`));
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

      <div className="navbar-right">
        {user ? (
          <div className="navbar-user" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span className="navbar-brand-text" aria-hidden="true">{user.name || user.email || "F1 Stats Hub"}</span>
            <button
              className="navbar-auth-btn"
              onClick={() => logoutUser()}
            >
              Log out
            </button>
          </div>
        ) : (
          <div className="navbar-auth" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link href="/login" className="navbar-auth-link">Log in</Link>
            <Link href="/register" className="navbar-auth-btn">Sign up</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
