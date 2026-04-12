"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="error-container" id="error-state">
      <h2 className="error-title">Data Load Failed</h2>
      <p className="error-message">
        Could not fetch F1 data. The API might be temporarily unavailable.
        Please try again.
      </p>
      <p className="error-message" style={{ fontSize: 12, color: "#666" }}>
        {error.message}
      </p>
      <button
        className="error-retry-btn"
        onClick={reset}
        id="error-retry-btn"
      >
        Try Again
      </button>
    </div>
  );
}
