import { expect, test, type Page } from '@playwright/test';

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD;
const USER_EMAIL = process.env.E2E_USER_EMAIL;

async function login(page: Page, email: string, password: string) {
  await page.goto('/admin/login', { waitUntil: 'networkidle' });
  await page.getByLabel('E-mail').fill(email);
  await page.getByLabel('Senha').fill(password);
  await page.getByRole('button', { name: 'Entrar' }).click();
}

test.describe('painel', () => {
  test.skip(!ADMIN_EMAIL || !ADMIN_PASSWORD, 'defina E2E_ADMIN_EMAIL e E2E_ADMIN_PASSWORD');

  test('sem login, /admin redireciona para a tela de entrada', async ({ page }) => {
    for (const route of ['/admin', '/admin/produtos', '/admin/mensagens']) {
      await page.goto(route);
      await expect(page).toHaveURL(/\/admin\/login/);
    }
  });

  test('senha errada mostra erro genérico', async ({ page }) => {
    await login(page, ADMIN_EMAIL!, 'senha-errada-123');
    await expect(page.getByText('E-mail ou senha incorretos')).toBeVisible();
  });

  test('usuário autenticado que não é admin é barrado', async ({ page }) => {
    test.skip(!USER_EMAIL, 'defina E2E_USER_EMAIL');
    await login(page, USER_EMAIL!, ADMIN_PASSWORD!);
    await expect(page.getByText(/não tem permissão/i)).toBeVisible();
    await page.goto('/admin/produtos');
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('criar produto → aparece no catálogo → desativar → some → excluir', async ({ page }) => {
    const nome = `Cobogó Teste E2E ${Date.now()}`;
    await login(page, ADMIN_EMAIL!, ADMIN_PASSWORD!);
    await expect(page).toHaveURL(/\/admin$/);

    // create
    // wait for hydration: the form library resets fields to their defaults when it mounts
    await page.goto('/admin/produtos/novo', { waitUntil: 'networkidle' });
    await page.getByLabel('Categoria').selectOption({ label: 'Cobogós' });
    await page.getByLabel('Nome do produto').fill(nome);
    await expect(page.getByLabel(/Endereço da página/)).toHaveValue(/^cobogo-teste-e2e-\d+$/);
    await page.getByLabel('Valor da medida 1').fill('39x39x07');
    await page.getByLabel(/^Rendimento/).fill('07 pç/m²');
    await page.getByLabel(/Peças por m²/).fill('7');
    await page.getByRole('checkbox', { name: 'Natural' }).click();
    await page.getByRole('button', { name: 'Salvar', exact: true }).click();
    await expect(page.getByText('Produto salvo com sucesso.')).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/produtos\?categoria=/);

    // public site reflects it without a deploy
    await page.goto(`/catalogo?q=${encodeURIComponent(nome)}`);
    await expect(page.getByRole('heading', { name: nome })).toBeVisible();
    await page.getByRole('heading', { name: nome }).getByRole('link').click();
    await expect(page.locator('h1')).toHaveText(nome);
    const productUrl = page.url();

    // deactivate from the list
    await page.goto('/admin/produtos');
    await page.getByLabel('Buscar produto pelo nome').fill(nome);
    const row = page.getByTestId('produto-row').filter({ hasText: nome });
    await row.getByRole('switch').click();
    await expect(page.getByText(/Produto desativado/)).toBeVisible();
    await page.goto(`/catalogo?q=${encodeURIComponent(nome)}`);
    await expect(page.getByText(/Nenhum produto encontrado/i)).toBeVisible();
    expect((await page.goto(productUrl))?.status()).toBe(404);

    // delete
    await page.goto('/admin/produtos');
    await page.getByLabel('Buscar produto pelo nome').fill(nome);
    await page.getByRole('button', { name: `Excluir ${nome}` }).click();
    await page.getByRole('button', { name: 'Excluir definitivamente' }).click();
    await expect(page.getByText('Produto excluído.')).toBeVisible();
    await expect(page.getByTestId('produto-row').filter({ hasText: nome })).toHaveCount(0);
  });

  test('mensagem do formulário de contato chega ao painel', async ({ page }) => {
    const marca = `Teste E2E ${Date.now()}`;
    await page.goto('/contato', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1800); // the anti-spam guard ignores forms sent in under 1.5 s
    await page.locator('#contato-nome').fill(marca);
    await page.locator('#contato-telefone').fill('24999990000');
    await expect(page.locator('#contato-telefone')).toHaveValue('(24) 99999-0000');
    await page.locator('#contato-mensagem').fill('Gostaria de um orçamento de piso drenante.');
    await page.getByRole('button', { name: 'Enviar mensagem' }).click();
    await expect(page.getByRole('link', { name: /Continuar no WhatsApp/ })).toBeVisible();

    await login(page, ADMIN_EMAIL!, ADMIN_PASSWORD!);
    await expect(page).toHaveURL(/\/admin$/);
    await page.goto('/admin/mensagens');
    const item = page.getByTestId('mensagem').filter({ hasText: marca });
    await expect(item).toBeVisible();
    await item.getByRole('button').first().click();
    await expect(item.getByRole('link', { name: 'Responder no WhatsApp' })).toHaveAttribute(
      'href',
      /wa\.me\/5524999990000/,
    );
    await item.getByRole('button', { name: 'Excluir' }).click();
    await page.getByRole('button', { name: 'Excluir definitivamente' }).click();
    await expect(page.getByText('Mensagem excluída.')).toBeVisible();
  });
});
