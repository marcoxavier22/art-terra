import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export function Breadcrumb({ items }: { items: { name: string; path?: string }[] }) {
  return (
    <nav aria-label="Você está em" className="text-sm">
      <ol className="text-muted flex flex-wrap items-center gap-x-1 gap-y-0.5">
        {items.map((item, i) => (
          <li key={item.name} className="flex items-center gap-1">
            {i > 0 ? <ChevronRight className="size-3.5 shrink-0" aria-hidden /> : null}
            {item.path ? (
              <Link
                href={item.path}
                className="hover:text-brand-green inline-flex min-h-11 items-center rounded px-0.5 hover:underline sm:min-h-8"
              >
                {item.name}
              </Link>
            ) : (
              <span aria-current="page" className="text-ink px-0.5 font-semibold">
                {item.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
