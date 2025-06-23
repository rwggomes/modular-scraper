## Scraper 2.0 ##

A modular and extensible web scraper that uses Puppeteer Extra, built for real-world use cases, like paginated data, stealthy browsing, AJAX scraping, equipped with a highly customizable CLI configuration.

Designed to be flexible and testable, it supports multiple scraping targets and file formats.


## Features ##

- **Multiple scraping targets** ('oscars', 'hockey', 'root', 'advanced', 'stealthTest')
- **Stealth support** with 'puppeteer-extra-plugin-stealth'
- **Flexible CLI** to customize scraping behavior
- Easy to add new scrapers
- Supports pagination, retries, and delay handling
- Optional page screenshots
- Save results in JSON or CSV
- Built-in logger with file output



## Installation ##

```bash
git clone https://github.com/rwggomes/scraper-2.0.git
cd scraper-2.0
npm install
```


## CLI Options ##

Customize scraper behavior using its options:

```bash
node multi_page_scraper.js [options]
```

| Option              | Alias | Type      | Default         | Description                                                                                          |
| ------------------- | ----- | --------- | --------------- | ---------------------------------------------------------------------------------------------------- |
| `--target`          | `-t`  | `string`  | `"root"`        | Defines what to scrape (e.g., `"oscars"`, `"hockey"`). Should match the name of an extractor module. |
| `--limit`           | `-l`  | `number`  | `3`             | Maximum number of pages to scrape. Use this to limit pagination.                                     |
| `--start-page`      |       | `number`  | `1`             | Page number to start scraping from (e.g., for resuming progress).                                    |
| `--delay`           | `-d`  | `number`  | `1000` (ms)     | Delay in milliseconds between page loads to avoid being rate-limited.                                |
| `--headless`        |       | `boolean` | `false`         | Run browser in headless mode (no GUI). Set to `true` for CI or background jobs.                      |
| `--format`          |       | `string`  | `"json"`        | Output format: `json` or `csv`.                                                                      |
| `--log`             |       | `string`  | `"scraper.log"` | Path to the log file that stores runtime info and errors.                                            |
| `--max-retries`     |       | `number`  | `3`             | Number of retry attempts if a page fails to load or scrape.                                          |
| `--download-assets` |       | `boolean` | `false`         | If true, downloads assets (images, files) linked from each page.                                     |
| `--debug`           |       | `boolean` | `false`         | Enable verbose console output for troubleshooting and development.                                   |
| `--dry-run`         |       | `boolean` | `false`         | Runs the scraper without saving any files (useful for testing).                                      |
| `--screenshot`      |       | `boolean` | `false`         | Capture a screenshot of each page visited. Screenshots can be used for validation or debugging.      |
| `--help`            | `-h`  | `boolean` | —               | Show this help message and exit.                                                                     |

---

## Example Usage ##

```bash
node multi_page_scraper.js --target oscars --limit 5 --delay 1500 --headless true --format csv --output data/oscars.csv
```

---

## Adding a New Scraper ##

To add a new target module:

1. Create a new file inside the `extractors/` directory (`newScraper.js`, for example).
2. Export an `async` function that receives a `page` instance and returns the scraped data.
3. Run the scraper with:

```bash
node multi_page_scraper.js --target oscars --limit 3 --delay 150 --headless false --format csv
```