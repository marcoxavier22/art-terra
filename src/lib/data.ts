import 'server-only';
import { unstable_cache } from 'next/cache';
import { createPublicClient } from './supabase/public';
import { CACHE_TAGS, FALLBACK_WHATSAPP } from './site';
import type {
  Catalog,
  Categoria,
  CategoriaComContagem,
  Cor,
  Face,
  GaleriaItem,
  Medida,
  Produto,
  Settings,
} from './types';

const ONE_HOUR = 3600;

export const DEFAULT_SETTINGS: Settings = {
  nome_empresa: 'Art Terra',
  slogan: 'Pisos · Vasos · Revestimentos',
  whatsapp: FALLBACK_WHATSAPP,
  email: 'contatoartterra@gmail.com',
  instagram: 'artterraoficial',
  endereco: 'Estrada Benjamin Constant, 4805, Mutirão (Km 5), Pinheiral/RJ',
  horario_atendimento: null,
  catalogo_pdf_url: null,
  hero_titulo: 'Elegância atemporal em concreto',
  hero_subtitulo:
    'Fábrica de pisos, cobogós, bordas atérmicas para piscina e artefatos de cimento em Pinheiral/RJ. Solidez, textura e acabamento refinado para ambientes internos e externos.',
  hero_imagem_url: null,
};

function logDataError(scope: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[data:${scope}] ${message}`);
}

export function parseMedidas(value: unknown): Medida[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (typeof item === 'string') return item.trim() ? [{ rotulo: null, valor: item.trim() }] : [];
    if (item && typeof item === 'object' && 'valor' in item) {
      const valor = String((item as { valor: unknown }).valor ?? '').trim();
      const rawRotulo = (item as { rotulo?: unknown }).rotulo;
      const rotulo = typeof rawRotulo === 'string' && rawRotulo.trim() ? rawRotulo.trim() : null;
      return valor ? [{ rotulo, valor }] : [];
    }
    return [];
  });
}

export function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === 'string' && v.length > 0);
}

/* ------------------------------- settings -------------------------------- */

const fetchSettings = unstable_cache(
  async (): Promise<Settings> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase.from('configuracoes').select('*').eq('id', 1).single();
    if (error) throw new Error(error.message);
    return {
      nome_empresa: data.nome_empresa || DEFAULT_SETTINGS.nome_empresa,
      slogan: data.slogan || DEFAULT_SETTINGS.slogan,
      whatsapp: data.whatsapp || DEFAULT_SETTINGS.whatsapp,
      email: data.email || DEFAULT_SETTINGS.email,
      instagram: (data.instagram || DEFAULT_SETTINGS.instagram).replace(/^@/, ''),
      endereco: data.endereco || DEFAULT_SETTINGS.endereco,
      horario_atendimento: data.horario_atendimento?.trim() || null,
      catalogo_pdf_url: data.catalogo_pdf_url || null,
      hero_titulo: data.hero_titulo || DEFAULT_SETTINGS.hero_titulo,
      hero_subtitulo: data.hero_subtitulo || DEFAULT_SETTINGS.hero_subtitulo,
      hero_imagem_url: data.hero_imagem_url || null,
    };
  },
  ['settings-v1'],
  { tags: [CACHE_TAGS.settings], revalidate: ONE_HOUR },
);

/** Never throws: the site must keep working (with defaults) if the database is unreachable. */
export async function getSettings(): Promise<Settings> {
  try {
    return await fetchSettings();
  } catch (error) {
    logDataError('settings', error);
    return DEFAULT_SETTINGS;
  }
}

/* -------------------------------- catalog -------------------------------- */

const fetchCatalog = unstable_cache(
  async (): Promise<Catalog> => {
    const supabase = createPublicClient();
    const [catRes, prodRes] = await Promise.all([
      supabase
        .from('categorias')
        .select('id, slug, nome, descricao, imagem_capa_url, ordem, ativo')
        .eq('ativo', true)
        .order('ordem')
        .order('nome'),
      supabase
        .from('produtos')
        .select(
          'id, categoria_id, slug, nome, descricao, medidas, rendimento, rendimento_pecas_m2, face, observacao_face, aplicacao, observacoes, imagem_principal_url, imagem_aplicacao_url, imagens_extras, destaque, ativo, ordem, updated_at, produto_cores(ordem, cor:cores(id, nome, hex, ordem))',
        )
        .eq('ativo', true)
        .order('ordem')
        .order('nome'),
    ]);
    if (catRes.error) throw new Error(catRes.error.message);
    if (prodRes.error) throw new Error(prodRes.error.message);

    const categoriaById = new Map<string, Categoria>(
      (catRes.data as Categoria[]).map((c) => [c.id, c]),
    );

    const produtos: Produto[] = [];
    for (const row of prodRes.data) {
      const categoria = categoriaById.get(row.categoria_id);
      if (!categoria) continue; // product in an inactive category stays hidden
      const links = (row.produto_cores ?? []) as unknown as { ordem: number; cor: Cor | null }[];
      const cores = links
        .filter((l): l is { ordem: number; cor: Cor } => Boolean(l.cor))
        .sort((a, b) => a.ordem - b.ordem || a.cor.ordem - b.cor.ordem)
        .map((l) => l.cor);
      produtos.push({
        id: row.id,
        categoria_id: row.categoria_id,
        slug: row.slug,
        nome: row.nome,
        descricao: row.descricao,
        medidas: parseMedidas(row.medidas),
        rendimento: row.rendimento,
        rendimento_pecas_m2:
          row.rendimento_pecas_m2 === null ? null : Number(row.rendimento_pecas_m2),
        face: row.face as Face | null,
        observacao_face: row.observacao_face,
        aplicacao: row.aplicacao,
        observacoes: row.observacoes,
        imagem_principal_url: row.imagem_principal_url,
        imagem_aplicacao_url: row.imagem_aplicacao_url,
        imagens_extras: parseStringArray(row.imagens_extras),
        destaque: row.destaque,
        ativo: row.ativo,
        ordem: row.ordem,
        updated_at: row.updated_at,
        categoria: {
          id: categoria.id,
          slug: categoria.slug,
          nome: categoria.nome,
          ordem: categoria.ordem,
        },
        cores,
      });
    }

    produtos.sort(
      (a, b) =>
        a.categoria.ordem - b.categoria.ordem ||
        a.ordem - b.ordem ||
        a.nome.localeCompare(b.nome, 'pt-BR'),
    );

    const categorias: CategoriaComContagem[] = (catRes.data as Categoria[]).map((c) => ({
      ...c,
      total: produtos.filter((p) => p.categoria_id === c.id).length,
    }));

    return { categorias, produtos };
  },
  ['catalog-v1'],
  { tags: [CACHE_TAGS.products, CACHE_TAGS.categories], revalidate: ONE_HOUR },
);

/** Throws when the database is unreachable so pages can render an error state. */
export async function getCatalog(): Promise<Catalog> {
  return fetchCatalog();
}

/** Same data, but degrades to an empty catalog instead of throwing. */
export async function getCatalogSafe(): Promise<Catalog & { ok: boolean }> {
  try {
    return { ...(await fetchCatalog()), ok: true };
  } catch (error) {
    logDataError('catalog', error);
    return { categorias: [], produtos: [], ok: false };
  }
}

export async function getProduct(categoriaSlug: string, slug: string): Promise<Produto | null> {
  const { produtos } = await getCatalog();
  return produtos.find((p) => p.slug === slug && p.categoria.slug === categoriaSlug) ?? null;
}

/* -------------------------------- gallery -------------------------------- */

const fetchGallery = unstable_cache(
  async (): Promise<GaleriaItem[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from('galeria')
      .select('id, imagem_url, legenda, alt, ordem, ativo')
      .eq('ativo', true)
      .order('ordem')
      .order('created_at');
    if (error) throw new Error(error.message);
    return data as GaleriaItem[];
  },
  ['gallery-v1'],
  { tags: [CACHE_TAGS.gallery], revalidate: ONE_HOUR },
);

export async function getGallery(): Promise<GaleriaItem[]> {
  try {
    return await fetchGallery();
  } catch (error) {
    logDataError('gallery', error);
    return [];
  }
}
