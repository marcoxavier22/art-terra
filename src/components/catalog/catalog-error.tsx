'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, RefreshCw, WifiOff } from 'lucide-react';
import { whatsappUrl } from '@/lib/whatsapp';
import { Button } from '@/components/ui/button';
import { WhatsAppIcon } from '@/components/ui/icons';

/** Error state for the catalogue: retries by revalidating the cached data on the server. */
export function CatalogError({
  whatsapp,
  retry,
}: {
  whatsapp: string;
  retry: () => Promise<void>;
}) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  return (
    <div className="container-site py-16">
      <div
        role="alert"
        className="border-line shadow-soft mx-auto max-w-lg rounded-[12px] border bg-white px-6 py-12 text-center"
      >
        <WifiOff className="text-brand-orange-ink mx-auto size-10" aria-hidden />
        <h2 className="font-heading text-brand-green mt-4 text-xl font-bold">
          Não foi possível carregar o catálogo
        </h2>
        <p className="text-muted mt-2">
          Pode ser uma instabilidade passageira. Tente de novo ou fale com a gente pelo WhatsApp.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button
            variant="green"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await retry();
                router.refresh();
              })
            }
          >
            {pending ? <Loader2 className="animate-spin" /> : <RefreshCw />}
            Tentar novamente
          </Button>
          <Button asChild variant="whatsapp">
            <a href={whatsappUrl(whatsapp)} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon />
              Falar no WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
