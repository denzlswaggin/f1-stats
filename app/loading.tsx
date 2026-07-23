export default function DashboardLoading() {
  return (
    <>
      {/* Header skeleton */}
      <div className="skeleton skeleton-header" />

      {/* Next race card skeleton */}
      <div className="skeleton skeleton-card" />

      {/* Season info skeleton */}
      <div className="skeleton" style={{ height: 20, width: 280, marginBottom: 24 }} />

      {/* Standings grid skeleton */}
      <div className="standings-grid">
        <div className="skeleton skeleton-table" />
        <div className="skeleton skeleton-table" />
      </div>
    </>
  );
}
