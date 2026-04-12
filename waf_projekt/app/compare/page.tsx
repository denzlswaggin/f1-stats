import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare Drivers – F1 Stats Hub",
  description: "Side-by-side comparison of Formula 1 drivers.",
};

export default function ComparePage() {
  return (
    <>
      <div className="page-header" id="compare-header">
        <h1>Compare Drivers</h1>
      </div>
      <div className="coming-soon">
        <div className="coming-soon-icon">⚡</div>
        <h2>Coming Soon</h2>
        <p>
          Head-to-head driver comparisons with interactive charts and data.
        </p>
      </div>
    </>
  );
}
