export default function Loading() {
  return (
    <div className="container-site py-16" aria-busy="true" aria-label="Carregando">
      <div className="bg-line/70 h-4 w-40 animate-pulse rounded" />
      <div className="bg-line/70 mt-5 h-10 w-full max-w-xl animate-pulse rounded" />
      <div className="bg-line/60 mt-4 h-5 w-full max-w-2xl animate-pulse rounded" />
      <div className="bg-line/60 mt-2 h-5 w-full max-w-lg animate-pulse rounded" />
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-line/60 aspect-[4/3] animate-pulse rounded-[12px]" />
        ))}
      </div>
    </div>
  );
}
