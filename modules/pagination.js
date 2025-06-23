//ARRUMAR O JEITO QUE PAGINAÇÃO É FEITA


import { scrapePage } from './scrapePage.js';
import { logInfo, logError } from './logger.js';
import fs from 'fs';

export async function handlePagination(page, limit, delay, baseUrl, extractor, options = {}) {
    logInfo('[pagination.js] handlePagination started');


  const results = [];

  // Ensure assets folder exists if screenshots are enabled
  if (options.screenshot && !fs.existsSync('assets')) {
    fs.mkdirSync('assets', { recursive: true });
  }

  for (let i = 1; i <= limit; i++) {
    const url = `${baseUrl}${i}`;
    logInfo(`Navigating to ${i}: ${url}`);


    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });

      if (options.screenshot) {
        const filePath = `assets/page-${i}.png`;
        await page.screenshot({ path: filePath, fullPage: true });
        logInfo(`Saved screenshot: ${filePath}`);

      }

      const pageData = await scrapePage(page, i, baseUrl, extractor);
      results.push(...pageData);

      await new Promise(res => setTimeout(res, delay));
    } catch (err) {
      logError(`Error scraping page ${i}: ${err.message}`);

    }
  }

  return results;
}
