-- Art Terra — vínculo inicial das fotos do Catálogo 2025
-- Aponta produtos, categorias e galeria para as imagens extraídas do PDF, servidas
-- pelo próprio site em /seed-images. Só preenche o que estiver vazio, então nunca
-- sobrescreve fotos enviadas pelo painel. `pnpm seed:images` copia esses arquivos
-- para o Supabase Storage e troca os endereços pelos do bucket.

update public.produtos
   set imagem_principal_url = '/seed-images/produtos/' || slug || '.webp'
 where imagem_principal_url is null
   and slug in (
     'borda-grega','borda-peito-de-pombo','borda-reta','grelha','piso-atermico',
     'cobogo-arabe','cobogo-assimetrico','cobogo-boomerang','cobogo-circulo','cobogo-floral','cobogo-folha',
     'cobogo-l','cobogo-labirinto','cobogo-quadriculado','cobogo-simetrico','cobogo-triangulo','cobogo-u',
     'paver-intertravado-dormido','piso-calcada-andorinha','piso-calcada-circulo','piso-calcada-copacabana',
     'piso-calcada-estriado','piso-calcada-quadriculado','piso-dormente','piso-drenante','piso-grama',
     'piso-tatil-alerta','piso-tatil-direcional',
     'banco-com-vaso','banco-curvo','banco-reto','margarida','pezao-pe-grande','pingadeira-chapeu','pingadeira-reta');

update public.produtos
   set imagem_aplicacao_url = '/seed-images/produtos/' || slug || '-aplicacao.webp'
 where imagem_aplicacao_url is null
   and slug in (
     'borda-grega','borda-peito-de-pombo','borda-reta','grelha','piso-atermico',
     'cobogo-arabe','cobogo-assimetrico','cobogo-boomerang','cobogo-circulo','cobogo-floral','cobogo-folha',
     'cobogo-l','cobogo-labirinto','cobogo-quadriculado','cobogo-simetrico','cobogo-triangulo','cobogo-u');

update public.categorias
   set imagem_capa_url = '/seed-images/categorias/' || slug || '.webp'
 where imagem_capa_url is null
   and slug in ('atermicos', 'cobogos', 'pisos', 'artificios');

insert into public.galeria (imagem_url, legenda, alt, ordem)
select v.imagem_url, v.legenda, v.alt, v.ordem
  from (values
    ('/seed-images/galeria/galeria-piscina-1.webp', 'Borda atérmica em piscina',
     'Borda atérmica clara acompanhando a lateral de uma piscina, com deck e espreguiçadeiras ao fundo', 1),
    ('/seed-images/galeria/galeria-cobogos-muro.webp', 'Muro de cobogós',
     'Muro de cobogós de concreto com desenhos variados e canteiro de plantas na base', 2),
    ('/seed-images/galeria/galeria-caminho.webp', 'Caminho de jardim',
     'Caminho de placas de concreto assentadas sobre o gramado de um jardim arborizado', 3),
    ('/seed-images/galeria/galeria-piscina-2.webp', 'Área de piscina',
     'Piscina iluminada à noite, cercada por piso e bordas atérmicas e vasos com palmeiras', 4),
    ('/seed-images/galeria/galeria-varanda.webp', 'Varanda com piso de concreto',
     'Varanda coberta com piso de concreto em grandes placas e sofá ao fundo', 5),
    ('/seed-images/galeria/galeria-fachada.webp', 'Fachada com cobogós',
     'Fachada branca com painéis de cobogó triângulo e jardim junto à calçada', 6),
    ('/seed-images/galeria/galeria-jardim-vertical.webp', 'Jardim vertical',
     'Parede de cobogós com floreiras e samambaias formando um jardim vertical', 7),
    ('/seed-images/galeria/galeria-cobogo-circulo.webp', 'Painel de cobogó círculo',
     'Painel de cobogós círculo brancos com plantas tropicais à frente', 8)
  ) as v (imagem_url, legenda, alt, ordem)
 where not exists (select 1 from public.galeria);
