## Scraper 2.0 ##

A modular and extensible web scraper that uses Puppeteer Extra, built for real-world use cases, like paginated data, stealthy browsing, AJAX scraping, equipped with a highly customizable CLI configuration.

Designed to be flexible and testable, it supports multiple scraping targets and file formats.

---

## Features ## 

- **Multiple scraping targets** ('oscars', 'hockey', 'root', 'advanced', 'stealthTest')
- **Stealth support** with 'puppeteer-extra-plugin-stealth'
- **Flexible CLI** to customize scraping behavior
- Easy to add new scrapers
- Supports pagination, retries, and delay handling
- Optional page screenshots
- Save results in JSON or CSV
- Built-in logger with file output

---

## Installation ## 

git clone https://github.com/your-username/scraper-2.0.git
cd scraper-2.0

# Install dependencies
npm install
