import { test, expect } from '@playwright/test';

test('homepage loads and shows main storefront content', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Goodminton/i);
  await expect(page.getByRole('heading', { name: /Sản phẩm mới/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /Trang chủ/i }).first()).toBeVisible();
  await expect(page.getByText(/Danh mục/i).first()).toBeVisible();
});

test('customer login remains on the login page for invalid credentials', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel(/Email hoặc số điện thoại/i).fill('hoangphilong1208@gmail.com');
  await page.getByLabel(/Mật khẩu/i).fill('Long@12082004');
  await page.getByRole('button', { name: /Đăng nhập/i }).click();

  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole('heading', { name: /Đăng nhập/i })).toBeVisible();
});

test('products page renders and exposes product listing', async ({ page }) => {
  await page.goto('/products');

  await expect(page.getByRole('heading', { name: /Tất cả sản phẩm/i })).toBeVisible();
  await expect(page.getByText(/sản phẩm/i).first()).toBeVisible();
  await expect(page.getByRole('combobox')).toBeVisible();
});

test('login page stays on the form and exposes auth affordances', async ({ page }) => {
  await page.goto('/login');

  await expect(page.getByRole('heading', { name: /Đăng nhập/i })).toBeVisible();

  await page.getByRole('button', { name: /Đăng nhập/i }).click();

  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole('link', { name: /Quên mật khẩu/i })).toBeVisible();
});

test('cart page shows empty-state for fresh cart', async ({ page }) => {
  await page.goto('/cart');

  await expect(page.getByRole('heading', { name: /Giỏ hàng đang trống/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /Mua sắm ngay/i })).toBeVisible();
});

test('about and contact pages render their public content', async ({ page }) => {
  await page.goto('/about');
  await expect(page.getByRole('heading', { name: /Goodminton — đam mê và chuyên nghiệp/i })).toBeVisible();

  await page.goto('/contact');
  await expect(page.getByRole('heading', { name: /Cần hỗ trợ\?/i })).toBeVisible();
  await expect(page.getByText(/Câu hỏi thường gặp/i)).toBeVisible();
});

test('unknown routes show the not-found experience', async ({ page }) => {
  await page.goto('/this-route-does-not-exist');

  await expect(page.getByText(/404 — Not Found/i)).toBeVisible();
  await expect(page.getByRole('heading', { name: /Trang không tồn tại/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /Về trang chủ/i })).toBeVisible();
});
