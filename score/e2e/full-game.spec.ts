import { test, expect } from "@playwright/test";

test.describe("Full game flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
    });
    await page.reload();
    await page.getByRole("button", { name: "Start Game" }).waitFor({ timeout: 10000 });
  });

  test("complete game: landing → setup → 9 holes → results → play again", async ({
    page,
  }) => {
    // ── Landing ──
    await expect(page.getByText("Playground HB")).toBeVisible();
    await page.getByRole("button", { name: "Start Game" }).click();

    // ── Setup ──
    const playerInput = page.getByPlaceholder("Enter player name");
    await expect(playerInput).toBeVisible();

    // Add two players via Enter key
    await playerInput.fill("Alice");
    await playerInput.press("Enter");

    await playerInput.fill("Bob");
    await playerInput.press("Enter");

    // Verify players listed (they appear as input values in editable fields)
    await expect(page.locator('input[value="Alice"]')).toBeVisible();
    await expect(page.locator('input[value="Bob"]')).toBeVisible();

    // Start scoring
    await page.getByRole("button", { name: /start scoring/i }).click();

    // ── Scoring (9 holes) ──
    for (let hole = 1; hole <= 9; hole++) {
      await expect(page.getByText(new RegExp(`Hole ${hole}:`))).toBeVisible();
      await expect(page.getByText(/Par \d/)).toBeVisible();

      // Tap + for Alice (first player's increase button)
      const increaseButtons = page.getByRole("button", { name: "Increase score" });
      await increaseButtons.first().click();

      if (hole < 9) {
        await page.getByRole("button", { name: /next hole/i }).click();
      } else {
        await page.getByRole("button", { name: /view results/i }).click();
      }
    }

    // ── Results ──
    await expect(page.getByText("Results")).toBeVisible();
    await expect(page.getByText("Alice")).toBeVisible();
    await expect(page.getByText("Bob")).toBeVisible();
    await expect(page.getByText(/strokes/i).first()).toBeVisible();

    // Play Again returns to landing
    await page.getByRole("button", { name: /play again/i }).click();
    await expect(page.getByRole("button", { name: "Start Game" })).toBeVisible();
  });

  test("cannot start game with no players", async ({ page }) => {
    await page.getByRole("button", { name: "Start Game" }).click();

    // "Start Scoring" button should be disabled
    const startButton = page.getByRole("button", { name: /start scoring/i });
    await expect(startButton).toBeDisabled();
  });

  test("can remove a player before starting", async ({ page }) => {
    await page.getByRole("button", { name: "Start Game" }).click();

    const playerInput = page.getByPlaceholder("Enter player name");
    await playerInput.fill("Alice");
    await playerInput.press("Enter");

    await playerInput.fill("Bob");
    await playerInput.press("Enter");

    // Remove first player (trash icon button)
    const removeButtons = page.locator('button:has(svg.lucide-trash-2)');
    await removeButtons.first().click();

    // Alice removed, Bob remains
    await expect(page.locator('input[value="Alice"]')).not.toBeVisible();
    await expect(page.locator('input[value="Bob"]')).toBeVisible();
  });

  test("previous hole navigation works", async ({ page }) => {
    await page.getByRole("button", { name: "Start Game" }).click();

    const playerInput = page.getByPlaceholder("Enter player name");
    await playerInput.fill("Alice");
    await playerInput.press("Enter");
    await page.getByRole("button", { name: /start scoring/i }).click();

    // On hole 1 — no previous button
    await expect(page.getByText(/Hole 1:/)).toBeVisible();
    await expect(page.getByRole("button", { name: /previous/i })).not.toBeVisible();

    // Go to hole 2
    await page.getByRole("button", { name: /next hole/i }).click();
    await expect(page.getByText(/Hole 2:/)).toBeVisible();

    // Go back to hole 1
    await page.getByRole("button", { name: /previous/i }).click();
    await expect(page.getByText(/Hole 1:/)).toBeVisible();
  });

  test("session persists on page refresh", async ({ page }) => {
    await page.getByRole("button", { name: "Start Game" }).click();

    const playerInput = page.getByPlaceholder("Enter player name");
    await playerInput.fill("Alice");
    await playerInput.press("Enter");
    await page.getByRole("button", { name: /start scoring/i }).click();

    await expect(page.getByText(/Hole 1:/)).toBeVisible();

    // Go to hole 2
    await page.getByRole("button", { name: /next hole/i }).click();
    await expect(page.getByText(/Hole 2:/)).toBeVisible();

    // Refresh
    await page.reload();

    // Should restore scoring phase — look for a specific hole heading
    await expect(page.getByRole("heading", { name: /Hole \d:/ })).toBeVisible({ timeout: 10000 });
  });
});
