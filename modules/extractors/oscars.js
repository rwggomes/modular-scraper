import { logInfo, logError, logWarn } from '../logger.js';

export function registerOscarArgs(yargsInstance) {
  return yargsInstance
    .option('year', {
      describe: 'Single year to scrape (for Oscars)',
      type: 'number'
    })
    .option('start-year', {
      describe: 'Start year (default: 2010)',
      type: 'number',
      default: 2010
    })
    .option('end-year', {
      describe: 'End year (default: 2015)',
      type: 'number',
      default: 2015
    });
}

export async function scrapeOscarYear(page, argv) {
  // Fallback defaults for start and end year
  const start = argv['start-year'] ?? 2010;
  const end = argv['end-year'] ?? 2015;

  // Generate years list based on args
  const years = argv.year
    ? [argv.year]
    : Array.from({ length: end - start + 1 }, (_, i) => start + i);

  const allResults = [];

  for (const year of years) {
    const url = `http://www.scrapethissite.com/pages/ajax-javascript/?ajax=true&year=${year}`;
    logInfo(`Navigating to ${url}`);

    try {
      await page.goto(url, { waitUntil: 'networkidle0' });

      const raw = await page.evaluate(() => document.body.innerText);
      const parsed = JSON.parse(raw);

      if (parsed.length === 0) {
        logWarn(`No films found for ${year}`);
        continue;
      }

      const yearResults = parsed.map(film => ({
        title: film.title?.trim() || 'N/A',
        nominations: Number(film.nominations),
        awards: Number(film.awards),
        bestPicture: !!film.best_picture,
        year: film.year
      }));

      allResults.push(...yearResults);
    } catch (err) {
      logError(`Failed to scrape year ${year}: ${err.message}`);
    }
  }

  return allResults;
}
