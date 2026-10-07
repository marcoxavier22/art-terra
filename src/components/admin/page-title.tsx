export function PageTitle({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="font-heading text-2xl font-bold text-brand-green sm:text-[1.75rem]">
          {title}
        </h1>
        {description ? <p className="mt-1 max-w-2xl text-muted">{description}</p> : null}
      </div>
      {children ? <div className="flex flex-wrap gap-2">{children}</div> : null}
    </div>
  );
}

export function Card({
  title,
  description,
  children,
  className = '',
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-[12px] border border-line bg-white p-5 shadow-soft sm:p-6 ${className}`}>
      {title ? (
        <header className="mb-4">
          <h2 className="font-heading text-lg font-semibold text-brand-green">{title}</h2>
          {description ? <p className="mt-0.5 text-sm text-muted">{description}</p> : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}
