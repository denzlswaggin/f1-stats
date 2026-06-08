"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { claimDailyLogin, claimPageView, claimDriverView } from "@/app/actions/points";
import Image from "next/image";

const TRACKED_PAGES: Record<string, string> = {
  "/results": "results",
  "/driver-standings": "driver-standings",
  "/constructor-standings": "constructor-standings",
  "/schedule": "schedule",
  "/compare": "compare",
};

interface Toast {
  id: number;
  amount: number;
  reason: string;
}

let toastCounter = 0;

export default function PointsTracker({ isLoggedIn }: { isLoggedIn: boolean }) {
  const pathname = usePathname();
  const dailyClaimed = useRef(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((amount: number, reason: string) => {
    const id = ++toastCounter;
    setToasts((prev) => [...prev, { id, amount, reason }]);

    // Auto-remove after animation
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2500);
  }, []);

  const notifyBalanceChange = useCallback(() => {
    window.dispatchEvent(new CustomEvent("coins-updated"));
  }, []);

  // Daily login claim (once per session)
  useEffect(() => {
    if (!isLoggedIn || dailyClaimed.current) return;
    dailyClaimed.current = true;

    claimDailyLogin().then((result) => {
      if (result.awarded) {
        showToast(result.amount, "Daily Login Bonus");
        notifyBalanceChange();
      }
    });
  }, [isLoggedIn, showToast, notifyBalanceChange]);

  useEffect(() => {
    if (!isLoggedIn) return;

    // Check for exact page match
    const pageKey = Object.keys(TRACKED_PAGES).find(
      (key) => pathname === key || pathname.startsWith(`${key}/`)
    );

    if (pageKey) {
      claimPageView(TRACKED_PAGES[pageKey]).then((result) => {
        if (result.awarded) {
          showToast(result.amount, `Viewed ${TRACKED_PAGES[pageKey].replace("-", " ")}`);
          notifyBalanceChange();
        }
      });
    }

    // Check for driver profile page: /driver/[driverId]
    const driverMatch = pathname.match(/^\/driver\/([^/]+)$/);
    if (driverMatch) {
      claimDriverView(driverMatch[1]).then((result) => {
        if (result.awarded) {
          showToast(result.amount, "Driver Profile View");
          notifyBalanceChange();
        }
      });
    }
  }, [pathname, isLoggedIn, showToast, notifyBalanceChange]);

  if (!isLoggedIn) return null;

  return (
    <>
      {toasts.map((toast) => (
        <div key={toast.id} className="coin-toast" aria-live="polite">
          <span className="coin-toast-icon">
            <Image src="/coin.svg" alt="Coin" width={16} height={16} />
          </span>
          <span className="coin-toast-amount">+{toast.amount}</span>
          <span className="coin-toast-reason">{toast.reason}</span>
        </div>
      ))}
    </>
  );
}
