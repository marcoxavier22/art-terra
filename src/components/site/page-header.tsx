import { SectionLabel } from '@/components/ui/section-label';

/** Green page banner used at the top of inner pages. */
export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="concrete-grain bg-brand-green relative overflow-hidden text-white">
      <span aria-hidden className="bg-brand-orange absolute right-0 bottom-0 h-2 w-28 sm:w-56" />
      <div className="container-site py-10 sm:py-14">
        <SectionLabel tone="dark">{eyebrow}</SectionLabel>
        <h1 className="mt-3 max-w-3xl text-[2rem] leading-tight font-extrabold sm:text-5xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-white/85">{description}</p>
        ) : null}
        {children}
      </div>
    </header>
  );
}
