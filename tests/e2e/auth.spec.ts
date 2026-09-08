import { expect, test } from "@playwright/test";

const email = process.env.SEED_ADMIN_EMAIL ?? "admin@optica-cr.local";
const password = process.env.SEED_ADMIN_PASSWORD ?? "";

test("login, admin y logout", async ({ page }) => {
  test.skip(!password, "SEED_ADMIN_PASSWORD es requerido para e2e");

  await page.goto("/login");
  await page.getByTestId("login-email").fill(email);
  await page.getByTestId("login-password").fill(password);
  await page.getByTestId("login-submit").click();
  await expect(page).toHaveURL(/\/admin/);
  await expect(page.getByRole("heading", { name: "Inicio" })).toBeVisible();
  await page.getByTestId("logout-button").click();
  await expect(page).toHaveURL(/\/login/);
});
