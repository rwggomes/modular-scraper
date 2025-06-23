import { loginIfNeeded } from '../login.js';
import { logInfo, logError } from '../logger.js';

export async function scrapeLoginChallenge(page, argv) {
  const protectedUrl = 'https://www.scrapethissite.com/pages/advanced/?gotcha=login';

  try {
    // ✅ Step 1: Simulate login and inject session cookie into Puppeteer
    await loginIfNeeded(page);

    // ✅ Step 2: Navigate to the protected page with the active session
    logInfo(`Accessing protected page: ${protectedUrl}`);
    await page.goto(protectedUrl, { waitUntil: 'domcontentloaded' });

    // ✅ Step 3: Confirm what content we see
    const content = await page.evaluate(() => document.body.innerText.trim());
    logInfo(`Scraped protected content:\n${content}`);

    return [{ content }];
  } catch (err) {
    logError(`Failed to scrape protected page: ${err.message}`);
    return [];
  }
}
