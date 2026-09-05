import { test, expect } from "@playwright/test";

async function startGame(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.evaluate(() => {
    sessionStorage.clear();
    localStorage.clear();
  });
  await page.reload();
  await expect(page.getByRole("heading", { name: "Playground HB" })).toBeVisible();
  await page.getByRole("button", { name: "Start Game" }).click();
}

async function pickPlayers(page: import("@playwright/test").Page, names: string[]) {
  await page.getByRole("button", { name: String(names.length), exact: true }).click();
  const inputs = page.getByPlaceholder("Player name");
  for (let i = 0; i < names.length; i++) {
    await inputs.nth(i).fill(names[i]);
  }
}

test.describe("Full game flow", () => {
  test("landing → setup → 9 holes → results → play again", async ({ page }) => {
    await startGame(page);
    await pickPlayers(page, ["Alice", "Bob"]);
    await expect(page.locator('input[value="Alice"]')).toBeVisible();
    await expect(page.locator('input[value="Bob"]')).toBeVisible();
    await page.getByRole("button", { name: /start scoring/i }).click();

    // Untouched holes count as 0: totals start at 0 for everyone.
    await expect(page.getByText(/Hole 1\b/)).toBeVisible();
    await expect(page.getByText("Total 0").first()).toBeVisible();

    for (let hole = 1; hole <= 9; hole++) {
      await expect(page.getByText(new RegExp(`Hole ${hole}\\b`))).toBeVisible();
      await expect(page.getByText(/Par \d/).first()).toBeVisible();

      await page.getByRole("button", { name: "Increase score" }).first().click();

      if (hole < 9) {
        await page.getByRole("button", { name: /next hole/i }).click();
      } else {
        await page.getByRole("button", { name: /see results/i }).first().click();
      }
    }

    await expect(page.getByRole("heading", { name: "Final Scores" })).toBeVisible();
    await expect(page.getByText("Alice")).toBeVisible();
    await expect(page.getByText("Bob")).toBeVisible();
    await expect(page.getByText(/strokes/i).first()).toBeVisible();

    await page.getByRole("button", { name: /play again/i }).click();
    await expect(page.getByRole("button", { name: "Start Game" })).toBeVisible();
  });

  test("scoring starts at zero and won't go below zero", async ({ page }) => {
    await startGame(page);
    await pickPlayers(page, ["Solo"]);
    await page.getByRole("button", { name: /start scoring/i }).click();

    // Untouched hole opens at 0 (shown as "–"); decrement is floored there.
    const decrease = page.getByRole("button", { name: "Decrease score" }).first();
    await expect(decrease).toBeDisabled(); // can't go below 0
    const increase = page.getByRole("button", { name: "Increase score" }).first();
    await increase.click(); // 0 → 1
    await expect(decrease).toBeEnabled();
    await increase.click(); // 1 → 2
    await decrease.click(); // 2 → 1
    await decrease.click(); // 1 → 0
    await expect(decrease).toBeDisabled();
  });

  test("cannot start scoring until every name is filled", async ({ page }) => {
    await startGame(page);
    await page.getByRole("button", { name: "2", exact: true }).click();
    await expect(page.getByRole("button", { name: /start scoring/i })).toBeDisabled();
    await page.getByPlaceholder("Player name").nth(0).fill("Alice");
    await page.getByPlaceholder("Player name").nth(1).fill("Bob");
    await expect(page.getByRole("button", { name: /start scoring/i })).toBeEnabled();
  });

  test("can remove a player before starting", async ({ page }) => {
    await startGame(page);
    await pickPlayers(page, ["Alice", "Bob"]);
    await page.locator("button:has(svg.lucide-trash-2)").first().click();
    await expect(page.locator('input[value="Alice"]')).not.toBeVisible();
    await expect(page.locator('input[value="Bob"]')).toBeVisible();
  });

  test("hole navigation forward and back", async ({ page }) => {
    await startGame(page);
    await pickPlayers(page, ["Alice"]);
    await page.getByRole("button", { name: /start scoring/i }).click();

    await expect(page.getByText(/Hole 1\b/)).toBeVisible();
    await expect(page.getByRole("button", { name: /previous hole/i })).toBeDisabled();

    await page.getByRole("button", { name: /next hole/i }).click();
    await expect(page.getByText(/Hole 2\b/)).toBeVisible();

    await page.getByRole("button", { name: /previous hole/i }).click();
    await expect(page.getByText(/Hole 1\b/)).toBeVisible();
  });

  test("session persists on refresh", async ({ page }) => {
    await startGame(page);
    await pickPlayers(page, ["Alice"]);
    await page.getByRole("button", { name: /start scoring/i }).click();

    await page.getByRole("button", { name: /next hole/i }).click();
    await expect(page.getByText(/Hole 2\b/)).toBeVisible();

    await page.reload();
    await expect(page.getByText(/Hole 2\b/)).toBeVisible({ timeout: 10000 });
  });
});
