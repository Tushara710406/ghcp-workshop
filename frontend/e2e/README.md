// This README explains how to run Playwright E2E tests for the NBA Sports App

## Prerequisites
- Node.js and npm installed
- Playwright and @playwright/test installed (see package.json devDependencies)
- App running locally at http://localhost:3000

## Running the Tests

1. Open a terminal in the `frontend` directory.
2. Run:

   npx playwright test

3. Screenshots will be saved in `e2e/screenshots/`.
4. An HTML report will be generated in `playwright-report/`.

## Test Flow
- Navigates to homepage
- Clicks "NBA Scores" and verifies scores
- Clicks "Stadiums" and verifies stadium cards
- Takes screenshots of each page
- Generates a pass/fail report

## Troubleshooting
- Ensure the app is running at http://localhost:3000
- If selectors fail, check for correct `data-testid` or class names in the UI
- To update screenshots, delete the old ones and re-run tests
