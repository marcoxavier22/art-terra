-- Art Terra — dados iniciais do Catálogo 2025 (35 produtos)
-- Idempotente: pode ser executado várias vezes. Reexecutar restaura os textos
-- originais dos 35 produtos, mas NÃO mexe em fotos, status (ativo) nem em
-- produtos/categorias/cores criados depois pelo painel.

-- ------------------------------ Categorias ---------------------------------
insert into public.categorias (slug, nome, descricao, ordem, ativo) values
  ('atermicos', 'Linha Atérmica',
   'A linha de pisos, bordas e acessórios para piscinas oferece conforto e segurança em áreas externas, com menor absorção de calor e textura antiderrapante.',
   1, true),
  ('cobogos', 'Cobogós',
   'Elemento vazado decorativo que une funcionalidade e estética: permite a passagem de luz e ventilação natural, equilibrando privacidade e integração dos espaços. Aplicável em áreas internas e externas.',
   2, true),
  ('pisos', 'Pisos',
   'Pisos de concreto para áreas externas, com durabilidade e resistência a alto fluxo e variações climáticas. Diversos formatos, texturas e acabamentos, de fácil manutenção.',
   3, true),
  ('artificios', 'Artifícios de Concreto',
   'Elementos decorativos modernos, contemporâneos e rústicos, com alta durabilidade e versatilidade, da composição estrutural ao enriquecimento estético dos ambientes.',
   4, true)
on conflict (slug) do update
  set nome = excluded.nome, descricao = excluded.descricao, ordem = excluded.ordem;

-- --------------------------------- Cores -----------------------------------
insert into public.cores (nome, hex, ordem) values
  ('Natural', '#7F7F7A', 1),
  ('Branco', '#FFFFFF', 2),
  ('Areia/Marfim', '#FFFFF0', 3),
  ('Chocolate', '#A07260', 4),
  ('Cinza', '#D0CDC8', 5),
  ('Preto', '#222226', 6),
  ('Amarelo', '#C9BF50', 7),
  ('Vermelho', '#D05252', 8),
  ('Azul', '#2B45E8', 9),
  ('Cedro', '#7A5B4F', 10),
  ('Castanho', '#8A5A3B', 11),
  ('Imbuia', '#4A4A48', 12),
  ('Nogueira', '#5A5550', 13),
  ('Peroba', '#6B5A5A', 14)
on conflict (nome) do update set hex = excluded.hex, ordem = excluded.ordem;

-- -------------------------------- Produtos ---------------------------------
with dados (cat, ordem, slug, nome, descricao, medidas, rendimento, pecas_m2, face, obs_face, aplicacao, observacoes, destaque) as (
  values
  -- Linha Atérmica
  ('atermicos', 1, 'borda-grega', 'Borda Grega',
   'Borda com dente para encaixe na borda da piscina, podendo ter quinas em 45º ou em triângulos.',
   '[{"rotulo":null,"valor":"15x100"},{"rotulo":null,"valor":"20x100"},{"rotulo":null,"valor":"25x100"},{"rotulo":null,"valor":"30x100"},{"rotulo":null,"valor":"35x100"},{"rotulo":null,"valor":"40x100"},{"rotulo":null,"valor":"45x100"},{"rotulo":null,"valor":"50x100"},{"rotulo":null,"valor":"55x100"}]'::jsonb,
   null, null::numeric, null, null, 'Bordas de piscinas e áreas molhadas externas', null, true),
  ('atermicos', 2, 'borda-peito-de-pombo', 'Borda Peito de Pombo',
   'Borda com formato curvilíneo e elegante, com encaixe e sobreposição nas bordas, com peças específicas de curvas e cantos.',
   '[{"rotulo":"Peça reta","valor":"35x50"},{"rotulo":"Peça canto","valor":"43x43"},{"rotulo":"Peça curva","valor":"35x85 / 35x105"}]'::jsonb,
   null, null, null, null, 'Bordas de piscinas, inclusive trechos curvos e cantos', null, false),
  ('atermicos', 3, 'borda-reta', 'Borda Reta',
   'Borda sem dente para sobrepor na borda da piscina, podendo ter quinas em 45º ou em triângulos.',
   '[{"rotulo":null,"valor":"15x100"},{"rotulo":null,"valor":"20x100"},{"rotulo":null,"valor":"25x100"},{"rotulo":null,"valor":"30x100"},{"rotulo":null,"valor":"35x100"},{"rotulo":null,"valor":"40x100"},{"rotulo":null,"valor":"45x100"},{"rotulo":null,"valor":"50x100"},{"rotulo":null,"valor":"55x100"}]'::jsonb,
   null, null, null, null, 'Bordas de piscinas e áreas molhadas externas', null, false),
  ('atermicos', 4, 'grelha', 'Grelha',
   'Peça para sobrepor áreas de drenos ao longo de bordas e pisos em áreas de piscina e afins.',
   '[{"rotulo":null,"valor":"15x50"}]'::jsonb,
   null, null, null, null, 'Drenos em áreas de piscina e afins', null, false),
  ('atermicos', 5, 'piso-atermico', 'Piso Atérmico',
   'Piso antiderrapante e poroso, com elevado fator de conforto térmico; complementar em áreas com bordas e alta exposição solar.',
   '[{"rotulo":null,"valor":"50x50"},{"rotulo":null,"valor":"100x100"}]'::jsonb,
   null, null, null, null, 'Entorno de piscinas e áreas externas com alta exposição solar', null, false),

  -- Cobogós (todos com 07 cm de espessura)
  ('cobogos', 1, 'cobogo-arabe', 'Cobogó Árabe',
   'Cobogó de concreto com trama geométrica de inspiração árabe. Deixa passar luz e ventilação e cria um painel decorativo em muros, fachadas e divisórias.',
   '[{"rotulo":null,"valor":"39x39x07"}]'::jsonb, '07 pç/m²', 7, 'uma_face', null, 'Áreas internas e externas', null, false),
  ('cobogos', 2, 'cobogo-assimetrico', 'Cobogó Assimétrico',
   'Cobogó de linhas retas com vazados de tamanhos diferentes, para composições contemporâneas. Acabamento nas duas faces.',
   '[{"rotulo":null,"valor":"39x39x07"}]'::jsonb, '07 pç/m²', 7, 'dupla_face', null, 'Áreas internas e externas', null, false),
  ('cobogos', 3, 'cobogo-boomerang', 'Cobogó Boomerang',
   'Cobogó com vazado angular em formato de bumerangue, que cria movimento no painel conforme a paginação. Acabamento nas duas faces.',
   '[{"rotulo":null,"valor":"30x30x07"}]'::jsonb, '12 pç/m²', 12, 'dupla_face', null, 'Áreas internas e externas', null, false),
  ('cobogos', 4, 'cobogo-circulo', 'Cobogó Círculo',
   'Cobogó com círculo central e arcos nos cantos, um desenho clássico que forma tramas contínuas quando assentado em sequência.',
   '[{"rotulo":null,"valor":"39x39x07"}]'::jsonb, '07 pç/m²', 7, 'uma_face', null, 'Áreas internas e externas', null, true),
  ('cobogos', 5, 'cobogo-floral', 'Cobogó Floral',
   'Cobogó com desenho de flor ao centro, de leitura delicada, indicado para muros, varandas e painéis decorativos.',
   '[{"rotulo":null,"valor":"39x39x07"}]'::jsonb, '07 pç/m²', 7, 'uma_face', null, 'Áreas internas e externas', null, false),
  ('cobogos', 6, 'cobogo-folha', 'Cobogó Folha',
   'Cobogó com vazado em formato de folha na diagonal, que permite paginações variadas. Acabamento nas duas faces.',
   '[{"rotulo":null,"valor":"30x30x07"}]'::jsonb, '12 pç/m²', 12, 'dupla_face', null, 'Áreas internas e externas', null, false),
  ('cobogos', 7, 'cobogo-l', 'Cobogó L',
   'Cobogó de desenho minimalista com vazado em formato de L, para painéis de linhas retas. Acabamento nas duas faces.',
   '[{"rotulo":null,"valor":"39x39x07"}]'::jsonb, '07 pç/m²', 7, 'dupla_face', null, 'Áreas internas e externas', null, false),
  ('cobogos', 8, 'cobogo-labirinto', 'Cobogó Labirinto',
   'Cobogó com faixas horizontais e verticais intercaladas, que formam um efeito de labirinto no conjunto.',
   '[{"rotulo":null,"valor":"39x39x07"}]'::jsonb, '07 pç/m²', 7, 'uma_face', null, 'Áreas internas e externas', null, false),
  ('cobogos', 9, 'cobogo-quadriculado', 'Cobogó Quadriculado',
   'Cobogó em grade de pequenos quadrados vazados, com boa privacidade sem bloquear luz e ventilação.',
   '[{"rotulo":null,"valor":"39x39x07"}]'::jsonb, '07 pç/m²', 7, 'uma_face', null, 'Áreas internas e externas', null, false),
  ('cobogos', 10, 'cobogo-simetrico', 'Cobogó Simétrico',
   'Cobogó com dois vazados retangulares iguais, de visual limpo e ordenado. Acabamento nas duas faces.',
   '[{"rotulo":null,"valor":"39x39x07"}]'::jsonb, '07 pç/m²', 7, 'dupla_face', null, 'Áreas internas e externas', null, false),
  ('cobogos', 11, 'cobogo-triangulo', 'Cobogó Triângulo',
   'Cobogó com recorte triangular em diagonal, que gera jogos de luz e sombra. Disponível com acabamento em uma face ou nas duas.',
   '[{"rotulo":null,"valor":"30x30x07"}]'::jsonb, '12 pç/m²', 12, 'uma_ou_dupla', null, 'Áreas internas e externas', null, false),
  ('cobogos', 12, 'cobogo-u', 'Cobogó U',
   'Cobogó de moldura aberta que pode receber floreira, ideal para compor jardins verticais. Acabamento nas duas faces.',
   '[{"rotulo":null,"valor":"39x39x07"}]'::jsonb, '07 pç/m²', 7, 'dupla_face', 'com ou sem floreira', 'Áreas internas e externas', null, false),

  -- Pisos
  ('pisos', 1, 'paver-intertravado-dormido', 'Paver Intertravado Dormido',
   'Bloco de concreto intertravado para pavimentação, assentado por encaixe entre as peças.',
   '[{"rotulo":null,"valor":"10x20x06"}]'::jsonb, '50 peças/m²', 50, null, null,
   'Áreas externas, calçadas, garagem e passagens para veículos', null, false),
  ('pisos', 2, 'piso-calcada-andorinha', 'Piso Calçada Andorinha',
   'Piso de concreto para calçadas com relevo de arcos concêntricos, que ajuda na aderência ao caminhar.',
   '[{"rotulo":null,"valor":"33x33x2,5"}]'::jsonb, '09 peças/m² (considerando rejuntamento)', 9, null, null,
   'Áreas externas, calçadas e garagens', null, false),
  ('pisos', 3, 'piso-calcada-circulo', 'Piso Calçada Círculo',
   'Piso de concreto para calçadas com relevo em círculos concêntricos e quadrículas.',
   '[{"rotulo":null,"valor":"33x33x2,5"}]'::jsonb, '09 peças/m² (considerando rejuntamento)', 9, null, null,
   'Áreas externas, calçadas e garagens', null, false),
  ('pisos', 4, 'piso-calcada-copacabana', 'Piso Calçada Copacabana',
   'Piso de concreto para calçadas com relevo em ondas, inspirado no tradicional calçadão carioca.',
   '[{"rotulo":null,"valor":"33x33x2,5"}]'::jsonb, '09 peças/m² (considerando rejuntamento)', 9, null, null,
   'Áreas externas, calçadas e garagens', null, false),
  ('pisos', 5, 'piso-calcada-estriado', 'Piso Calçada Estriado',
   'Piso de concreto para calçadas com relevo de estrias em diagonal.',
   '[{"rotulo":null,"valor":"33x33x2,5"}]'::jsonb, '09 peças/m² (considerando rejuntamento)', 9, null, null,
   'Áreas externas, calçadas e garagens', null, false),
  ('pisos', 6, 'piso-calcada-quadriculado', 'Piso Calçada Quadriculado',
   'Piso de concreto para calçadas com relevo quadriculado, um padrão clássico de passeio público.',
   '[{"rotulo":null,"valor":"33x33x2,5"}]'::jsonb, '09 peças/m² (considerando rejuntamento)', 9, null, null,
   'Áreas externas, calçadas e garagens', null, false),
  ('pisos', 7, 'piso-dormente', 'Piso Dormente',
   'Piso de concreto com acabamento madeirado que reproduz o visual de dormentes de madeira, para caminhos e jardins.',
   '[{"rotulo":null,"valor":"30x74x4,5"}]'::jsonb, '5 peças/m²', 5, null, null,
   'Áreas externas, calçadas e jardins', 'Acabamento madeirado.', true),
  ('pisos', 8, 'piso-drenante', 'Piso Drenante',
   'Piso de concreto poroso que deixa a água passar pela peça, ajudando a reduzir poças.',
   '[{"rotulo":null,"valor":"50x50x3"}]'::jsonb, '4 peças/m²', 4, null, null,
   'Calçadas e garagens', null, false),
  ('pisos', 9, 'piso-grama', 'Piso Grama',
   'Piso de concreto vazado em grade, para plantio de grama entre as aberturas.',
   '[{"rotulo":null,"valor":"43x33"}]'::jsonb, '7 a 8 peças/m²', 7.5, null, null,
   'Áreas externas, calçadas e jardins',
   'Para garagens e passagens de veículos, usar o piso reforçado com ferragens.', false),
  ('pisos', 10, 'piso-tatil-alerta', 'Piso Tátil Alerta',
   'Piso tátil de alerta, com relevo em pontos, para sinalização de calçadas.',
   '[{"rotulo":null,"valor":"20x20x06 (05 peças/m linear)"},{"rotulo":null,"valor":"25x25x2,5 (04 peças/m linear)"},{"rotulo":null,"valor":"33x33x2,5 (03 peças/m linear)"}]'::jsonb,
   'Por metro linear (ver medidas)', null, null, null, 'Calçadas', null, false),
  ('pisos', 11, 'piso-tatil-direcional', 'Piso Tátil Direcional',
   'Piso tátil direcional, com relevo em faixas, para orientar o percurso em calçadas.',
   '[{"rotulo":null,"valor":"20x20x06 (05 peças/m linear)"},{"rotulo":null,"valor":"25x25x2,5 (04 peças/m linear)"},{"rotulo":null,"valor":"33x33x2,5 (03 peças/m linear)"}]'::jsonb,
   'Por metro linear (ver medidas)', null, null, null, 'Calçadas', null, false),

  -- Artifícios de Concreto
  ('artificios', 1, 'banco-com-vaso', 'Banco com Vaso',
   'Banco de jardim com vasos de concreto nas extremidades, que servem de apoio ao assento.',
   '[{"rotulo":null,"valor":"192x42 cm"}]'::jsonb, null, null, null, null, 'Jardins, varandas e áreas de convivência', null, false),
  ('artificios', 2, 'banco-curvo', 'Banco Curvo',
   'Banco de concreto com assento em curva, para jardins, praças e áreas de convivência.',
   '[{"rotulo":null,"valor":"100x36 cm"}]'::jsonb, null, null, null, null, 'Jardins, praças e áreas de convivência', null, false),
  ('artificios', 3, 'banco-reto', 'Banco Reto',
   'Banco de concreto de linhas retas, para jardins, varandas e áreas externas.',
   '[{"rotulo":null,"valor":"120x36 cm"}]'::jsonb, null, null, null, null, 'Jardins, varandas e áreas externas', null, false),
  ('artificios', 4, 'margarida', 'Margarida',
   'Peça decorativa redonda em formato de flor, usada como pisante em jardins e gramados.',
   '[{"rotulo":null,"valor":"Diâm. 36 cm"}]'::jsonb, null, null, null, null, 'Jardins e gramados', null, false),
  ('artificios', 5, 'pezao-pe-grande', 'Pezão / Pé Grande',
   'Pisante decorativo em formato de pé, para marcar caminhos em jardins e gramados.',
   '[{"rotulo":null,"valor":"51x29 cm"}]'::jsonb, null, null, null, null, 'Jardins e gramados', null, false),
  ('artificios', 6, 'pingadeira-chapeu', 'Pingadeira Chapéu / Capa de Muro / Rufo',
   'Capa de muro com caimento para os dois lados, que protege o topo do muro e afasta a água da chuva.',
   '[{"rotulo":null,"valor":"80x19 cm"}]'::jsonb, null, null, null, null, 'Topo de muros e muretas', null, false),
  ('artificios', 7, 'pingadeira-reta', 'Pingadeira Reta / Capa de Muro / Rufo',
   'Capa de muro de superfície plana, que protege o topo do muro e dá acabamento à alvenaria.',
   '[{"rotulo":null,"valor":"80x19 cm"},{"rotulo":null,"valor":"80x23 cm"}]'::jsonb, null, null, null, null, 'Topo de muros e muretas', null, false)
)
insert into public.produtos
  (categoria_id, ordem, slug, nome, descricao, medidas, rendimento, rendimento_pecas_m2, face, observacao_face, aplicacao, observacoes, destaque, ativo)
select c.id, d.ordem, d.slug, d.nome, d.descricao, d.medidas, d.rendimento, d.pecas_m2, d.face, d.obs_face, d.aplicacao, d.observacoes, d.destaque, true
  from dados d
  join public.categorias c on c.slug = d.cat
on conflict (slug) do update
  set categoria_id = excluded.categoria_id,
      ordem = excluded.ordem,
      nome = excluded.nome,
      descricao = excluded.descricao,
      medidas = excluded.medidas,
      rendimento = excluded.rendimento,
      rendimento_pecas_m2 = excluded.rendimento_pecas_m2,
      face = excluded.face,
      observacao_face = excluded.observacao_face,
      aplicacao = excluded.aplicacao,
      observacoes = excluded.observacoes,
      destaque = excluded.destaque;

-- ----------------------------- Cores por produto ---------------------------
with paletas (grupo, cor, ordem) as (
  values
  ('atermicos', 'Areia/Marfim', 1), ('atermicos', 'Branco', 2), ('atermicos', 'Chocolate', 3),
  ('atermicos', 'Cinza', 4), ('atermicos', 'Preto', 5),
  ('cobogos', 'Natural', 1), ('cobogos', 'Branco', 2),
  ('paver', 'Natural', 1), ('paver', 'Amarelo', 2), ('paver', 'Preto', 3), ('paver', 'Vermelho', 4),
  ('calcada', 'Natural', 1), ('calcada', 'Amarelo', 2), ('calcada', 'Preto', 3),
  ('calcada', 'Vermelho', 4), ('calcada', 'Azul', 5),
  ('madeirado', 'Cedro', 1), ('madeirado', 'Castanho', 2), ('madeirado', 'Imbuia', 3),
  ('madeirado', 'Nogueira', 4), ('madeirado', 'Peroba', 5),
  ('natural', 'Natural', 1)
),
grupos (slug, grupo) as (
  select p.slug,
         case
           when c.slug = 'atermicos' then 'atermicos'
           when c.slug = 'cobogos' then 'cobogos'
           when p.slug = 'paver-intertravado-dormido' then 'paver'
           when p.slug = 'piso-dormente' then 'madeirado'
           when p.slug in ('piso-drenante', 'piso-grama') then 'natural'
           when c.slug = 'pisos' then 'calcada'
         end
    from public.produtos p
    join public.categorias c on c.id = p.categoria_id
   where p.slug in (
     'borda-grega','borda-peito-de-pombo','borda-reta','grelha','piso-atermico',
     'cobogo-arabe','cobogo-assimetrico','cobogo-boomerang','cobogo-circulo','cobogo-floral','cobogo-folha',
     'cobogo-l','cobogo-labirinto','cobogo-quadriculado','cobogo-simetrico','cobogo-triangulo','cobogo-u',
     'paver-intertravado-dormido','piso-calcada-andorinha','piso-calcada-circulo','piso-calcada-copacabana',
     'piso-calcada-estriado','piso-calcada-quadriculado','piso-dormente','piso-drenante','piso-grama',
     'piso-tatil-alerta','piso-tatil-direcional')
)
insert into public.produto_cores (produto_id, cor_id, ordem)
select p.id, co.id, pa.ordem
  from grupos g
  join public.produtos p on p.slug = g.slug
  join paletas pa on pa.grupo = g.grupo
  join public.cores co on co.nome = pa.cor
on conflict (produto_id, cor_id) do update set ordem = excluded.ordem;
