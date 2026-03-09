import { test, expect } from "@playwright/test";

test.describe("Generator page", () => {
  test("loads and shows either sign-in CTA or form", async ({ page }) => {
    await page.goto("/generator");
    await expect(page.locator("h1")).toContainText(/generate|content/i);
    const signInBlock = page.getByText(/sign in to generate/i);
    const urlInput = page.getByPlaceholder(/youtube|watch\.v/i);
    const transcriptTab = page.getByRole("button", { name: /paste transcript/i);
    await expect(signInBlock.or(urlInput).or(transcriptTab)).toBeVisible({ timeout: 10000 });
  });

  test("has YouTube URL and Paste transcript tabs when signed in", async ({ page }) => {
    await page.goto("/generator");
    const urlTab = page.getByRole("button", { name: /youtube url/i });
    const transcriptTab = page.getByRole("button", { name: /paste transcript/i);
    if (await urlTab.isVisible()) {
      await expect(transcriptTab).toBeVisible();
    }
  });
});
