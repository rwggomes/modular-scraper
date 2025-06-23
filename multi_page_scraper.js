import puppeteer from 'puppeteer-extra';// Import necessary libraries and local modules
import yargs from 'yargs';                              // CLI argument parsing
import { hideBin } from 'yargs/helpers';                // Helper for yargs to ignore node binary
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

// Imports for modules
import { handlePagination } from './modules/pagination.js'; // Pagination logic
import { saveResults } from './modules/save.js';        // Saving output results
import { setupLogger, logInfo, logStart, logEnd } from './modules/logger.js';;
import { extractHockeyTeams } from './modules/extractors/hockey.js'; // Hockey data extractor
import { scrapeOscarYear, registerOscarArgs } from './modules/extractors/oscars.js';    // Oscar data extractor
import { scrapeRootPage } from './modules/extractors/root.js';
import { scrapeLoginChallenge } from './modules/extractors/loginTest.js';
import { scrapeStealthTest } from './modules/extractors/stealthTest.js'; // ADD THIS LINE

puppeteer.use(StealthPlugin());

let parser = yargs(hideBin(process.argv))
  .usage('Usage: $0 [options]')
  .option('target', {
    alias: 't',
    describe: 'What to scrape',
    type: 'string',
    default: 'root',
  });


const TARGETS = {
    stealthTest: {
    extractor: scrapeStealthTest,
    paginated: false
  },
  advanced: {
    extractor: scrapeLoginChallenge,
    paginated: false
  },
  hockey: {
    baseUrl: 'http://www.scrapethissite.com/pages/forms/?page=',
    extractor: extractHockeyTeams,
    paginated: true
  },
  oscars: {
    extractor: scrapeOscarYear,
    registerArgs: registerOscarArgs,
    paginated: false
  },
  root: {
    baseUrl: 'http://www.scrapethissite.com/pages/',
    extractor: scrapeRootPage,
    paginated: false
  },
  
  // Add more targets here as needed
};
const preliminaryArgv = parser.parseSync();
const chosenTarget = preliminaryArgv.target;

// If the chosen target has extra CLI args to register, do that here
if (TARGETS[chosenTarget]?.registerArgs) {
  parser = TARGETS[chosenTarget].registerArgs(parser);
}

// Add general CLI options
const argv = parser
  .option('limit', {
    alias: 'l',
    describe: 'Max number of pages to scrape',
    type: 'number',
    default: 3,
  })
  .option('start-page', {
    describe: 'Start scraping from this page',
    type: 'number',
    default: 1,
  })
  .option('delay', {
    alias: 'd',
    describe: 'Delay between pages in ms',
    type: 'number',
    default: 1000,
  })
  .option('headless', {
    describe: 'Run browser in headless mode',
    type: 'boolean',
    default: false,
  })
  .option('format', {
    describe: 'Output format',
    choices: ['json', 'csv'],
    default: 'json',
  })
  .option('log', {
    describe: 'Path to log file',
    type: 'string',
    default: 'scraper.log',
  })
  .option('max-retries', {
    describe: 'Retry attempts per page',
    type: 'number',
    default: 3,
  })
  .option('download-assets', {
    describe: 'Download linked assets',
    type: 'boolean',
    default: false,
  })
  .option('debug', {
    describe: 'Verbose output',
    type: 'boolean',
    default: false,
  })
  .option('dry-run', {
    describe: 'Run without saving files',
    type: 'boolean',
    default: false,
  })
  .option('screenshot', {
    describe: 'Take screenshot of each page',
    type: 'boolean',
    default: false,
  })
  .help()
  .alias('help', 'h')
  .argv;

// Extract key options
const limit = argv.limit;
const delay = argv.delay;
const headless = argv.headless;
const target = argv.target;

// Setup the logging system
setupLogger(argv.log);


// Main scraping function
const run = async () => {
  const start = logStart(); // Log when the scraping starts

  // Exit if an unsupported target is specified
  if (!TARGETS[target]) {
    console.error(`Unknown target: ${target}`);
    process.exit(1);
  }

  // Extract target-specific config
  const { baseUrl, extractor, paginated } = TARGETS[target];
  const fullBaseUrl = TARGETS[target].baseUrl;

  // Launch Puppeteer browser
  const browser = await puppeteer.launch({ headless });
  const page = await browser.newPage();

  logInfo(`Selected target: ${target}`);
  logInfo(`Paginated: ${paginated}`);

  try {
    
    let results = [];

    const options = {
      screenshot: argv.screenshot
    };

    // Handling paginated vs. single-page targets
    if (paginated) {
      results = await handlePagination(page, limit, delay, baseUrl, extractor, options);

    } else {
      results = await extractor(page, argv); // For non-paginated targets
    }

    //Results are saved UNLESS dry-run is enabled
    await saveResults(results, argv.format, '', target);  // "target" comes from CLI argument


  } catch (err) {
    console.error('Fatal error:', err);
  } finally {
    await browser.close();  
    logEnd(start);          // Log completion and duration
  }
};

// Run the scraper
run();
