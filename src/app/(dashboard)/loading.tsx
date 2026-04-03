export default function DashboardLoading() {
  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="h-8 w-56 animate-pulse rounded-md bg-slate-200" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-xl border border-slate-200 bg-white"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-64 animate-pulse rounded-xl border border-slate-200 bg-white" />
        <div className="h-64 animate-pulse rounded-xl border border-slate-200 bg-white" />
      </div>
    </main>
  );
}
