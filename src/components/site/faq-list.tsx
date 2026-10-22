import { ChevronDown } from 'lucide-react';
import type { Faq } from '@/lib/seo-content';

/** Accessible FAQ accordion built on <details> (no JS). Pair with faqJsonLd on the page. */
export function FaqList({ faqs }: { faqs: readonly Faq[] }) {
  return (
    <div className="divide-line border-line divide-y rounded-[12px] border bg-white">
      {faqs.map((faq) => (
        <details key={faq.pergunta} className="group">
          <summary className="font-heading text-brand-green flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-base font-semibold [&::-webkit-details-marker]:hidden">
            <h3 className="text-[1rem] leading-snug">{faq.pergunta}</h3>
            <ChevronDown
              aria-hidden
              className="text-brand-orange size-5 shrink-0 transition-transform group-open:rotate-180"
            />
          </summary>
          <p className="text-muted px-5 pb-5 leading-relaxed">{faq.resposta}</p>
        </details>
      ))}
    </div>
  );
}
