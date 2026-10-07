# Art Terra — relatório final (07/10/2026)

## Endereços

|             |                                                         |
| ----------- | ------------------------------------------------------- |
| Site        | https://art-terra-five.vercel.app                       |
| Painel      | https://art-terra-five.vercel.app/admin                 |
| Repositório | https://github.com/marcoxavier22/art-terra              |
| Supabase    | projeto `art-terra` (`eawxntdmivtppwmypefo`), São Paulo |
| Vercel      | projeto `art-terra`, funções em `gru1`                  |

**Credenciais:** nenhuma senha foi criada nem gravada no repositório. O usuário administrador
ainda precisa ser criado pelo dono do projeto (passo 1 de "Pendências").

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

## Pendências (só o dono da conta consegue fazer)

1. **Criar o administrador:** Supabase → Authentication → Users → _Add user_ (e-mail + senha,
   _Auto Confirm_). Depois, no SQL Editor:
   `insert into public.admin_users (user_id) values ('<UUID_DO_USUARIO>');`
2. **Desativar cadastro público:** Authentication → Sign In / Providers → Email → desligar
   _Allow new users to sign up_.
3. **URLs de autenticação:** Authentication → URL Configuration → _Site URL_
   `https://art-terra-five.vercel.app` e _Redirect URL_
   `https://art-terra-five.vercel.app/admin/auth/callback` (necessário para "Esqueci minha senha").
4. **Confirmar o WhatsApp:** o site usa (24) 99229-0708; o PDF do catálogo traz (24) 99201-1676.
5. Conferir no painel da Vercel se Analytics e Speed Insights estão ligados, e olhar os logs de
   execução (a integração usada no deploy não tem permissão de leitura de logs).

## Não feito

- Fotos do protótipo Lovable não foram baixadas; todas as imagens vêm do PDF do catálogo.
- As fotos ficam no próprio site (`/seed-images`), não no Supabase Storage; `pnpm seed:images`
  faz a cópia quando houver a `service_role` na máquina local. Fotos novas do painel já vão
  para o Storage.

## Sugestões

Domínio próprio (`artterra.com.br`), Google Search Console com o sitemap, Perfil da Empresa no
Google, Meta Pixel, aviso por e-mail a cada mensagem recebida e WhatsApp Business API.
