import { logInfo, logError } from './logger.js';

export async function loginIfNeeded(page) {
  const loginUrl = 'https://www.scrapethissite.com/pages/advanced/?gotcha=login';

  try {
    logInfo(`Navigating to login challenge page: ${loginUrl}`);
    await page.goto(loginUrl, { waitUntil: 'domcontentloaded' });

    // Grab visible body text
    const pageText = await page.evaluate(() => document.body.innerText.trim().toLowerCase());

    // Look for known "fake login" phrases
    const bypassed = (
      pageText.includes('congratulations') ||
      pageText.includes('you solved the login') ||
      pageText.includes('you have bypassed the login') ||
      pageText.includes('secret content') ||  // Fallback match
      !pageText.includes('login')             // No login-related instructions
    );

    if (bypassed) {
      logInfo('✅ No login needed or challenge auto-bypassed. Proceeding...');
      return;
    }

    // Optional fallback: show warning
    throw new Error('⚠️ Unexpected login challenge structure — no known bypass pattern detected.');

  } catch (err) {
    logError(`Login challenge check failed: ${err.message}`);
    throw err;
  }
}

  
