/**
 * Copies the bundled catalogue photos (public/seed-images) to Supabase Storage and
 * points products, categories and gallery rows at the bucket URLs.
 *
 *   pnpm seed:images
 *
 * Runs LOCALLY only. Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in
 * .env.local (never commit that file, never expose the service role to the browser).
 * Safe to re-run: uploads are upserts and only rows still pointing at /seed-images change.
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, '');
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error(
    'Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY em .env.local antes de rodar.',
  );
  process.exit(1);
}

const BUCKET = 'produtos';
const ROOT = path.join(process.cwd(), 'public', 'seed-images');
const FOLDERS = ['produtos', 'categorias', 'galeria'] as const;
const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
const publicUrl = (key: string) => `${url}/storage/v1/object/public/${BUCKET}/${key}`;
/** '/seed-images/produtos/x.webp' -> bucket URL (or null when it is not a seed path). */
const remap = (value: string | null, uploaded: Set<string>) => {
  if (!value?.startsWith('/seed-images/')) return null;
  const key = value.slice('/seed-images/'.length);
  return uploaded.has(key) ? publicUrl(key) : null;
};

async function main() {
  const uploaded = new Set<string>();
  for (const folder of FOLDERS) {
    const files = (await readdir(path.join(ROOT, folder))).filter((f) => f.endsWith('.webp'));
    for (const file of files) {
      const key = `${folder}/${file}`;
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(key, await readFile(path.join(ROOT, folder, file)), {
          contentType: 'image/webp',
          cacheControl: '31536000',
          upsert: true,
        });
      if (error) throw new Error(`Falha ao enviar ${key}: ${error.message}`);
      uploaded.add(key);
    }
    console.log(`✔ ${folder}: ${files.length} imagens enviadas`);
  }

  let changed = 0;
  const produtos = await supabase
    .from('produtos')
    .select('id, imagem_principal_url, imagem_aplicacao_url');
  if (produtos.error) throw new Error(produtos.error.message);
  for (const p of produtos.data) {
    const principal = remap(p.imagem_principal_url, uploaded);
    const aplicacao = remap(p.imagem_aplicacao_url, uploaded);
    if (!principal && !aplicacao) continue;
    const { error } = await supabase
      .from('produtos')
      .update({
        ...(principal ? { imagem_principal_url: principal } : {}),
        ...(aplicacao ? { imagem_aplicacao_url: aplicacao } : {}),
      })
      .eq('id', p.id);
    if (error) throw new Error(error.message);
    changed++;
  }

  const categorias = await supabase.from('categorias').select('id, imagem_capa_url');
  if (categorias.error) throw new Error(categorias.error.message);
  for (const c of categorias.data) {
    const capa = remap(c.imagem_capa_url, uploaded);
    if (!capa) continue;
    const { error } = await supabase
      .from('categorias')
      .update({ imagem_capa_url: capa })
      .eq('id', c.id);
    if (error) throw new Error(error.message);
    changed++;
  }

  const galeria = await supabase.from('galeria').select('id, imagem_url');
  if (galeria.error) throw new Error(galeria.error.message);
  for (const g of galeria.data) {
    const imagem = remap(g.imagem_url, uploaded);
    if (!imagem) continue;
    const { error } = await supabase.from('galeria').update({ imagem_url: imagem }).eq('id', g.id);
    if (error) throw new Error(error.message);
    changed++;
  }

  console.log(`✔ ${changed} registros agora apontam para o Supabase Storage.`);
  console.log('  O site pode levar até 1 hora para refletir (ou salve qualquer item no painel).');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
