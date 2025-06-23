import { logInfo, logError } from '../logger.js';

export async function scrapeRootPage(page, argv) {
  const homepage = 'http://www.scrapethissite.com/';
  logInfo(`Navigating to homepage: ${homepage}`);

  try {
    await page.goto(homepage, { waitUntil: 'load', timeout: 30000 });

    // Click the "Sandbox" nav link
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'load', timeout: 30000 }),
      page.click('a.nav-link[href="/pages/"]'),
    ]);

    logInfo(`Navigated to sandbox page`);

    // Scrape each .page block (there are 5)
    const sections = await page.$$eval('.page', blocks => {
      return blocks.map(block => {
        const titleEl = block.querySelector('h3.page-title > a');
        const descEl = block.querySelector('p.lead.session-desc');

        return {
          title: titleEl?.textContent.trim() || 'N/A',
          href: titleEl?.href || '',
          description: descEl?.textContent.trim() || 'No description'
        };
      });
    });

    logInfo(`Found ${sections.length} sandbox sections`);
    return sections;

  } catch (err) {
    logError(`Failed to scrape root page: ${err.message}`);
    return [];
  }
}
