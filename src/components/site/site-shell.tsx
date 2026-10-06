import { getCatalogSafe, getSettings } from '@/lib/data';
import { DEFAULT_QUOTE_MESSAGE, whatsappUrl } from '@/lib/whatsapp';
import { TooltipProvider } from '@/components/ui/tooltip';
import { FloatingActions } from './floating-actions';
import { Footer } from './footer';
import { Header } from './header';

/** Public chrome (header, footer, floating buttons) shared by every public page. */
export async function SiteShell({ children }: { children: React.ReactNode }) {
  const [settings, catalog] = await Promise.all([getSettings(), getCatalogSafe()]);
  const whatsappHref = whatsappUrl(settings.whatsapp, DEFAULT_QUOTE_MESSAGE);

  return (
    <TooltipProvider delayDuration={150}>
      <a
        href="#conteudo"
        className="focus:bg-brand-green sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-md focus:px-4 focus:py-3 focus:font-semibold focus:text-white"
      >
        Pular para o conteúdo
      </a>
      <Header whatsappHref={whatsappHref} />
      <main id="conteudo" className="min-h-[60vh] pt-[68px]">
        {children}
      </main>
      <Footer settings={settings} categorias={catalog.categorias} />
      <FloatingActions whatsappHref={whatsappHref} />
    </TooltipProvider>
  );
}
