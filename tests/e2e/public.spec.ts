import { expect, test } from '@playwright/test';

const ROUTES: [string, RegExp][] = [
  ['/', /Elegância atemporal/i],
  ['/sobre', /Solidez, sofisticação e aparência/i],
  ['/contato', /.+/],
  ['/catalogo', /Catálogo 2025/i],
  ['/catalogo?cat=atermicos', /Catálogo 2025/i],
  ['/catalogo?cat=cobogos', /Catálogo 2025/i],
  ['/catalogo?cat=pisos', /Catálogo 2025/i],
  ['/catalogo?cat=artificios', /Catálogo 2025/i],
  ['/catalogo/cobogos/cobogo-circulo', /Cobogó Círculo/i],
  ['/privacidade', /Privacidade/i],
];

test.describe('rotas públicas', () => {
  for (const [route, heading] of ROUTES) {
    test(`${route} abre por link direto, sem 404 e sem rolagem horizontal`, async ({ page }) => {
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('h1')).toHaveText(heading);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
      // survives F5
      const again = await page.reload();
      expect(again?.status()).toBe(200);
    });
  }

  test('rota inexistente mostra a 404 customizada', async ({ page }) => {
    const response = await page.goto('/pagina-que-nao-existe');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('link', { name: /Voltar ao início/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /catálogo/i }).first()).toBeVisible();
  });

  test('produto inexistente retorna 404', async ({ page }) => {
    const response = await page.goto('/catalogo/cobogos/nao-existe');
    expect(response?.status()).toBe(404);
  });

  test('sitemap e robots', async ({ request }) => {
    const sitemap = await request.get('/sitemap.xml');
    expect(sitemap.status()).toBe(200);
    const xml = await sitemap.text();
    expect(xml).toContain('/catalogo/cobogos/cobogo-circulo');
    expect(xml).not.toContain('/admin');
    const robots = await (await request.get('/robots.txt')).text();
    expect(robots).toMatch(/Disallow: \/admin/);
  });
});

test.describe('catálogo', () => {
  test('mostra os 35 produtos do seed e os contadores por linha', async ({ page }) => {
    await page.goto('/catalogo');
    await expect(page.getByText(/Exibindo 35 produtos/i)).toBeVisible();
    const tabs = page.locator('#conteudo').getByRole('navigation', { name: 'Linhas do catálogo' });
    await expect(tabs).toContainText('35');
    await expect(tabs.getByRole('button', { name: /Cobogós/ })).toContainText('12');
    await expect(tabs.getByRole('button', { name: /Pisos/ })).toContainText('11');
    await expect(tabs.getByRole('button', { name: /Linha Atérmica/ })).toContainText('5');
    await expect(tabs.getByRole('button', { name: /Artifícios/ })).toContainText('7');
  });

  test('aba de categoria atualiza a URL sem recarregar', async ({ page }) => {
    await page.goto('/catalogo');
    await page
      .locator('#conteudo')
      .getByRole('navigation', { name: 'Linhas do catálogo' })
      .getByRole('button', { name: /Cobogós/ })
      .click();
    await expect(page).toHaveURL(/cat=cobogos/);
    await expect(page.getByText(/Exibindo 12 produtos/i)).toBeVisible();
  });

  test('busca ignora acentos e maiúsculas; estado vazio oferece limpar', async ({ page }) => {
    await page.goto('/catalogo', { waitUntil: 'networkidle' });
    const search = page.getByRole('searchbox');
    await search.fill('COBOGO arabe');
    await expect(page).toHaveURL(/q=COBOGO/);
    await expect(page.getByText(/Exibindo 1 produto\b/i)).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Cobogó Árabe' })).toBeVisible();

    await search.fill('zzzz-nada');
    await expect(page.getByText(/Nenhum produto encontrado/i)).toBeVisible();
    await page
      .getByRole('button', { name: /Limpar/i })
      .first()
      .click();
    await expect(page.getByText(/Exibindo 35 produtos/i)).toBeVisible();
  });

  test('botão do WhatsApp leva a mensagem do produto', async ({ page }) => {
    await page.goto('/catalogo?cat=cobogos');
    const link = page.getByRole('link', { name: 'Consultar no WhatsApp: Cobogó Círculo' });
    const href = (await link.getAttribute('href')) ?? '';
    expect(href).toMatch(/^https:\/\/wa\.me\/55\d{10,11}\?text=/);
    expect(decodeURIComponent(href.split('text=')[1])).toBe(
      'Olá! Tenho interesse no produto Cobogó Círculo. Poderia me passar um orçamento?',
    );
    await expect(link).toHaveAttribute('rel', /noopener/);
  });

  test('detalhe: especificações, calculadora e relacionados', async ({ page }) => {
    await page.goto('/catalogo/cobogos/cobogo-circulo');
    await expect(page.getByText('39x39x07').or(page.getByText('39×39×07')).first()).toBeVisible();
    await expect(page.getByText(/07 pç\/m²/).first()).toBeVisible();
    await expect(page.getByText(/Uma face/).first()).toBeVisible();
    const area = page.getByLabel(/Área/i).first();
    await area.fill('10');
    await expect(page.getByText(/77/).first()).toBeVisible(); // 70 peças + 10%
    await expect(page.getByText(/estimativa/i).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: /Outros produtos da linha/i })).toBeVisible();
  });

  test('piso tátil não mostra a calculadora', async ({ page }) => {
    await page.goto('/catalogo/pisos/piso-tatil-alerta');
    await expect(page.locator('h1')).toHaveText(/Piso Tátil Alerta/);
    await expect(page.getByLabel(/Área/i)).toHaveCount(0);
  });
});

test.describe('contato', () => {
  test('mapa, como chegar e validação do formulário', async ({ page }) => {
    await page.goto('/contato', { waitUntil: 'networkidle' });
    await expect(page.locator('iframe[src*="google.com/maps"]')).toHaveAttribute('title', /.+/);
    await expect(page.getByRole('link', { name: /Como chegar/i })).toHaveAttribute(
      'href',
      /google\.com\/maps\/dir/,
    );
    await page.getByRole('button', { name: 'Enviar mensagem' }).click();
    await expect(page.getByText('Informe seu nome.')).toBeVisible();
  });
});
