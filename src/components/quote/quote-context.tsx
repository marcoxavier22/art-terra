'use client';
import * as React from 'react';
import {
  parseStoredItems,
  quoteKey,
  type QuoteContact,
  type QuoteItem,
  type Unidade,
} from '@/lib/quote';

const STORAGE_KEY = 'artterra:orcamento:v1';
const CONTACT_KEY = 'artterra:orcamento:contato:v1';

interface QuoteState {
  items: QuoteItem[];
  ready: boolean;
  contact: QuoteContact;
  add: (item: Omit<QuoteItem, 'key'>) => void;
  update: (key: string, changes: Partial<Pick<QuoteItem, 'quantidade' | 'unidade'>>) => void;
  remove: (key: string) => void;
  clear: () => void;
  has: (produtoId: string) => boolean;
  setContact: (contact: QuoteContact) => void;
}

const QuoteContext = React.createContext<QuoteState | null>(null);

function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode or storage full: the list still works for this visit */
  }
}

const EMPTY_CONTACT: QuoteContact = { nome: '', cidade: '', observacoes: '' };

/** Keeps the visitor's quote list in this browser (no account needed). */
export function QuoteProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<QuoteItem[]>([]);
  const [contact, setContactState] = React.useState<QuoteContact>(EMPTY_CONTACT);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    setItems(parseStoredItems(read(STORAGE_KEY, [])));
    const c = read<Partial<QuoteContact>>(CONTACT_KEY, {});
    setContactState({
      nome: typeof c.nome === 'string' ? c.nome : '',
      cidade: typeof c.cidade === 'string' ? c.cidade : '',
      observacoes: typeof c.observacoes === 'string' ? c.observacoes : '',
    });
    setReady(true);
    // keep several open tabs in sync
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setItems(parseStoredItems(read(STORAGE_KEY, [])));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const commit = React.useCallback((next: QuoteItem[]) => {
    setItems(next);
    write(STORAGE_KEY, next);
  }, []);

  const value = React.useMemo<QuoteState>(
    () => ({
      items,
      ready,
      contact,
      add(item) {
        const key = quoteKey(item.produtoId, item.cor, item.medida);
        const existing = items.find((i) => i.key === key);
        commit(
          existing
            ? items.map((i) =>
                i.key === key
                  ? { ...i, quantidade: item.quantidade ?? i.quantidade, unidade: item.unidade }
                  : i,
              )
            : [...items, { ...item, key }],
        );
      },
      update(key, changes) {
        commit(items.map((i) => (i.key === key ? { ...i, ...changes } : i)));
      },
      remove(key) {
        commit(items.filter((i) => i.key !== key));
      },
      clear() {
        commit([]);
      },
      has(produtoId) {
        return items.some((i) => i.produtoId === produtoId);
      },
      setContact(next) {
        setContactState(next);
        write(CONTACT_KEY, next);
      },
    }),
    [items, ready, contact, commit],
  );

  return <QuoteContext.Provider value={value}>{children}</QuoteContext.Provider>;
}

const noopSubscribe = () => () => {};

/**
 * True only after THIS component has hydrated. Streamed parts of a page (Suspense) hydrate
 * later than the provider, so reading the stored list during their hydration would render
 * "Na lista" where the server rendered "+ Orçar" and break hydration.
 */
function useHydrated() {
  return React.useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

export function useQuote(): QuoteState {
  const ctx = React.useContext(QuoteContext);
  if (!ctx) throw new Error('useQuote must be used inside <QuoteProvider>');
  const hydrated = useHydrated();
  return React.useMemo(
    () =>
      hydrated
        ? ctx
        : { ...ctx, items: [], ready: false, contact: EMPTY_CONTACT, has: () => false },
    [ctx, hydrated],
  );
}

export type { Unidade };
