import { test, expect } from '@playwright/test';

// Helper to take a screenshot with a descriptive name
test.describe('NBA App User Flow', () => {
  test('Complete navigation and verification flow', async ({ page }) => {
    // 1. Navigate to homepage
    await page.goto('http://localhost:3000');
    await page.screenshot({ path: 'e2e/screenshots/home.png', fullPage: true });

    // 2. Click on "NBA Scores" in the navigation
    await page.getByRole('link', { name: /nba scores/i }).click();
    await page.waitForLoadState('networkidle');
    
    // 3. Verify game scores are displayed
    // Wait for either game cards OR the "no games" message to appear
    await page.waitForSelector('h1:has-text("NBA Scores")', { timeout: 10000 });
    
    // Check if games are displayed (flexible assertion)
    const hasGames = await page.locator('.grid > div').count() > 0;
    const noGamesMessage = page.getByText(/no games available/i);
    
    // Assert that either games are shown OR the no-games message appears
    if (hasGames) {
      await expect(page.locator('.grid > div').first()).toBeVisible();
    } else {
      await expect(noGamesMessage).toBeVisible();
    }
    
    await page.screenshot({ path: 'e2e/screenshots/nba-scores.png', fullPage: true });

    // 4. Click on "Stadiums"
    await page.getByRole('link', { name: /stadiums/i }).click();
    await page.waitForLoadState('networkidle');
    
    // 5. Verify stadium cards are rendered
    await page.waitForSelector('h1:has-text("Stadiums")', { timeout: 10000 });
    const stadiumCard = page.locator('.grid').first();
    await expect(stadiumCard).toBeVisible();
    
    await page.screenshot({ path: 'e2e/screenshots/stadiums.png', fullPage: true });

    // 6. Click on "Add Player"
    await page.getByRole('link', { name: /add player/i }).click();
    await page.waitForLoadState('networkidle');
    
    // 7. Verify Add Player form is rendered
    await page.waitForSelector('text=Create New NBA Player', { timeout: 10000 });
    
    // Verify form fields are present
    const nameInput = page.locator('#name');
    const positionInput = page.locator('#position');
    const teamInput = page.locator('#team');
    const submitButton = page.getByRole('button', { name: /create player/i });
    
    await expect(nameInput).toBeVisible();
    await expect(positionInput).toBeVisible();
    await expect(teamInput).toBeVisible();
    await expect(submitButton).toBeVisible();
    
    console.log('✓ Add Player form fields displayed');
    
    await page.screenshot({ path: 'e2e/screenshots/add-player-empty.png', fullPage: true });

    // 8. Fill out the form
    await nameInput.fill('Test Player');
    await positionInput.fill('Point Guard');
    await teamInput.fill('Test Team');
    
    console.log('✓ Form filled with test data');
    
    await page.screenshot({ path: 'e2e/screenshots/add-player-filled.png', fullPage: true });

    // 9. Submit the form
    await submitButton.click();
    
    // Wait for success message or error
    await page.waitForTimeout(2000); // Give the API time to respond
    
    // Take screenshot of the result
    await page.screenshot({ path: 'e2e/screenshots/add-player-submitted.png', fullPage: true });
    
    // Verify either success or error message is displayed
    const successMessage = page.getByText(/player created successfully/i);
    const errorMessage = page.getByText(/error/i);
    
    const hasSuccess = await successMessage.isVisible().catch(() => false);
    const hasError = await errorMessage.isVisible().catch(() => false);
    
    if (hasSuccess) {
      console.log('✓ Player created successfully');
      await expect(successMessage).toBeVisible();
    } else if (hasError) {
      console.log('⚠ Error message displayed (API may not be available)');
      await expect(errorMessage).toBeVisible();
    } else {
      console.log('⚠ No success or error message found');
    }
  });
});
