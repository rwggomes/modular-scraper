import { retryWithBackoff } from './retry.js';

/**
 * Scrape a single page using a custom extractor function
 * @param {import('puppeteer').Page} page - Puppeteer Page object
 * @param {number} pageNum - The page number to fetch
 * @param {string} baseUrl - The base URL, e.g. "http://site.com/page="
 * @param {Function} extractFn - A function that runs in the browser to extract structured data
 * @returns {Promise<Array>} - An array of extracted results
 */
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
