import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Race Results – F1 Stats Hub",
  description: "Formula 1 race results and race history.",
};

export default function ResultsPage() {
  return (
    <>
      <div className="page-header" id="results-header">
        <h1>Race Results</h1>
      </div>
      <div className="coming-soon">
        <div className="coming-soon-icon">🏆</div>
        <h2>Coming Soon</h2>
        <p>Detailed race results and lap-by-lap data will be available here.</p>
      </div>
    </>
  );
}
