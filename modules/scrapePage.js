import { retryWithBackoff } from './retry.js';

export async function scrapePage(page, pageNum, baseUrl, extractFn) {
  const url = `${baseUrl}${pageNum}`;
  return await retryWithBackoff(async () => {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
      return await page.evaluate(extractFn);
    } catch (err) {
      throw new Error(`Scrape failure on ${url}: ${err.message}`);
    }
  });
}
