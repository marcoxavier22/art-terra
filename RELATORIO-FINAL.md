# Art Terra — relatório final (07/10/2026)

## Endereços

|             |                                                         |
| ----------- | ------------------------------------------------------- |
| Site        | https://art-terra-five.vercel.app                       |
| Painel      | https://art-terra-five.vercel.app/admin                 |
| Repositório | https://github.com/marcoxavier22/art-terra              |
| Supabase    | projeto `art-terra` (`eawxntdmivtppwmypefo`), São Paulo |
| Vercel      | projeto `art-terra`, funções em `gru1`                  |

**Credenciais:** nenhuma senha foi criada nem gravada no repositório. A senha do administrador foi
definida pelo próprio dono no Supabase.

## O que foi feito

Site público (Home, Sobre, Contato, Catálogo, detalhe do produto, Privacidade, 404), painel
completo (produtos, categorias, cores, galeria, configurações, mensagens), banco com RLS, 35
produtos e fotos do Catálogo 2025, testes automatizados, deploy contínuo (push na `main` publica).

## Checklist de aceite

**Rotas e navegação**

- [x] Rotas públicas abrem sem 404 e sobrevivem a F5 — conferido em produção (25 endereços)
- [x] Links de header, footer, hero, cards e botões — conferido pelos testes e2e (ambiente local)
- [x] 404 customizada, com status 404 real — conferido em produção

**Catálogo**

- [x] 35 produtos com medidas, rendimento, face e cores — contagens 5/12/11/7 em produção
- [x] Abas com contadores, busca sem acento, filtro por cor, ordenação
- [x] Estado vazio, skeleton e erro
- [x] WhatsApp de cada produto com a mensagem correta — conferido em produção
- [x] Detalhe com galeria, especificações, calculadora e relacionados

**Home, localização e contato**

- [x] Hero com gradiente direcional, badges e botões
- [x] Mapa incorporado, "Como chegar", endereço no rodapé
- [x] Formulário grava no Supabase, valida, bloqueia spam (honeypot + 3 envios/10 min) e oferece
      WhatsApp — conferido em produção; as mensagens de teste foram apagadas

**Painel admin**

- [x] `/admin` inacessível sem login — conferido em produção
- [ ] Login, CRUDs, upload e ordenação **em produção** — testados só no ambiente local
      (45 testes e2e + roteiro manual); em produção dependem da criação do usuário admin
- [x] Alterações refletem no site sem deploy — conferido no ambiente local
- [x] Painel utilizável no celular — conferido no ambiente local (360 e 390 px)

**Qualidade e infraestrutura**

- [x] `get_advisors`: nenhum alerta de erro ou aviso (só 5 notas informativas esperadas)
- [x] RLS em todas as tabelas — em produção, visitante não lê mensagens, não escreve em nenhuma
      tabela e não envia arquivos
- [x] Nenhum segredo no repositório
- [x] `pnpm lint`, `pnpm typecheck`, `pnpm build`, 26 testes unitários, 45 e2e
- [ ] Lighthouse mobile ≥ 90 **em produção** — não medido (cota do PageSpeed esgotada no dia).
      Local: Performance 90–97 (Home) e 90–92 (Catálogo), Acessibilidade 100, SEO 100
- [x] Deploy na Vercel com rotas testadas em produção
- [x] Sem rolagem horizontal de 360 a 1536 px (local) e em 375 px (produção)

## Configuração de acesso (feita em 07/10/2026)

- Administrador: `marcotuliobatistaxavier@gmail.com` (usuário criado pelo dono no Supabase e
  liberado em `admin_users`). A senha é a definida na criação; se precisar, use "Esqueci minha
  senha" na tela de login.
- Site URL `https://art-terra-five.vercel.app` e Redirect URL
  `https://art-terra-five.vercel.app/**` configuradas.
- Cadastro público desligado (`disable_signup = true`).

## Atualização de 21/10/2026

- O Supabase gratuito tinha **pausado por inatividade** (site sem catálogo e painel sem login).
  Projeto reativado e criado o keep-alive diário (`/api/keepalive` + Vercel Cron em `vercel.json`).
- Redefinição de senha: o link agora funciona em qualquer aparelho (antes só no mesmo navegador
  em que foi pedido) e a tela avisa quando o link expirou ou quando o e-mail não pôde ser enviado.
  Testado de ponta a ponta no ambiente local.
- WhatsApp de todo o site trocado para (24) 99201-1676 (banco, reserva na Vercel e textos).
- Conta `marcotuliobatistaxavier@gmail.com`: ativa, confirmada, com senha e liberada como admin.
- Domínio `artterraoficial.com.br` (e `www`, redirecionando) adicionado ao projeto na Vercel;
  falta o DNS no Registro.br.
- Domínio de envio criado no Resend (São Paulo) para o e-mail de redefinição; falta o DNS.

## Redesign UX/SEO (21/10/2026)

Análise de 7 concorrentes (Castelatto, Solarium, Vigafort, Central do Concreto, ABA, Casa do
Concreto, Art Glass) e redesign com foco no celular. Documento completo: "Art Terra — Análise de
mercado e redesign UX/SEO" (Claude Docs).

- Catálogo em 2 colunas no celular, busca fixa, painel de filtros (uso, cor, ordem) e filtro
  "Onde você vai usar?" (piscina, fachada/muro, calçada/garagem, jardim).
- Lista de orçamento (`/orcamento`): vários produtos com quantidade e unidade enviados em uma
  única mensagem de WhatsApp; fica salva no aparelho do visitante.
- Barra de navegação inferior no celular e CTA fixo na página do produto.
- Páginas indexáveis por linha (`/catalogo/atermicos`, `/cobogos`, `/pisos`, `/artificios`) com
  texto, FAQ e dados estruturados (FAQPage, ItemList); `?cat=` antigo redireciona.
- Home: busca no hero, seletor por uso, "Como pedir" em 3 passos, FAQ e 12 cidades atendidas;
  LocalBusiness com as cidades; sitemap com as linhas.
- 30 testes unitários e 53 e2e passando; sem rolagem horizontal de 360 a 1536 px.

## Domínio no ar (22/10/2026)

- `https://artterraoficial.com.br` publicado com HTTPS; `www` redireciona (308) para o domínio.
- DNS no Registro.br: A, CNAME `www`, DKIM/SPF/MX do Resend e DMARC (`_dmarc` = `v=DMARC1; p=none;`).
- Resend: domínio **verificado** (sa-east-1).
- Vercel: `NEXT_PUBLIC_SITE_URL = https://artterraoficial.com.br`, novo deploy feito; sitemap,
  canonical e dados estruturados já usam o domínio.
- Supabase: Site URL = `https://artterraoficial.com.br`; Redirect URLs incluem o domínio, o `www`
  e os endereços da Vercel.

## Pendências

1. **Supabase → Authentication → Emails → SMTP Settings** (só o dono, porque exige a chave do
   Resend): ligar "Enable custom SMTP" e preencher host `smtp.resend.com`, porta `465`,
   usuário `resend`, senha = uma API key do Resend (permissão "Sending access", domínio
   artterraoficial.com.br), remetente `nao-responda@artterraoficial.com.br`, nome `Art Terra`.
   Sem isso, o e-mail de redefinição de senha sai pelo servidor de teste do Supabase (~2 por hora).
2. Google Search Console: adicionar o domínio e enviar `https://artterraoficial.com.br/sitemap.xml`.

## Não feito

- Fotos do protótipo Lovable não foram baixadas; todas as imagens vêm do PDF do catálogo.
- As fotos ficam no próprio site (`/seed-images`), não no Supabase Storage; `pnpm seed:images`
  faz a cópia quando houver a `service_role` na máquina local. Fotos novas do painel já vão
  para o Storage.

## Sugestões

Domínio próprio (`artterra.com.br`), Google Search Console com o sitemap, Perfil da Empresa no
Google, Meta Pixel, aviso por e-mail a cada mensagem recebida e WhatsApp Business API.
