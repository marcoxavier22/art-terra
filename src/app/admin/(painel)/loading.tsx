export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Carregando">
      <div className="bg-line/70 h-8 w-48 animate-pulse rounded" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="bg-line/60 h-28 animate-pulse rounded-[12px]" />
        ))}
      </div>
      <div className="bg-line/50 mt-6 h-64 animate-pulse rounded-[12px]" />
    </div>
  );
}
