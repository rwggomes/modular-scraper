import fs from 'fs-extra';
import path from 'path';
import { format as formatDate } from 'date-fns';
import { logInfo } from './logger.js';
import pkg from 'csv-writer';
import { createWriteStream } from 'fs';
import { parse as parseUrl } from 'url';
import http from 'http';
import https from 'https';

const { createObjectCsvWriter } = pkg;

/**
 * Save structured scraping results to output/{target}-{timestamp}.json or .csv
 */
export async function saveResults(data, format = 'json', _outputPath = '', target = 'results', argv = {}) {
  if (!data || data.length === 0) {
    console.warn('No data to save.');
    return;
  }

  const timestamp = formatDate(new Date(), 'yyyy-MM-dd_HH-mm-ss');
  const folder = 'output';
  const filename = `${target}-${timestamp}.${format}`;
  const outputPath = path.join(folder, filename);

  await fs.ensureDir(folder);

  if (format === 'csv') {
    const csvWriter = createObjectCsvWriter({
      path: outputPath,
      header: Object.keys(data[0]).map((key) => ({ id: key, title: key })),
    });
    await csvWriter.writeRecords(data);
  } else {
    await saveToFile(outputPath, data);
  }

  logInfo(`Saved ${data.length} items to ${outputPath}`);

  if (argv.downloadAssets) {
    const assetUrls = extractAssetUrls(data);
    await downloadAssets(assetUrls, target);
  }
}

/**
 * Saves content to a given file path.
 * Automatically ensures the directory exists.
 * @param {string} filePath - Full path (including filename)
 * @param {Buffer|string|Object} data - Data to write (string, JSON object, or Buffer)
 * @param {Object} [options] - Optional fs-extra write options
 */
export async function saveToFile(filePath, data, options = {}) {
  await fs.ensureDir(path.dirname(filePath));

  if (Buffer.isBuffer(data)) {
    await fs.writeFile(filePath, data, options);
  } else if (typeof data === 'object') {
    await fs.writeJson(filePath, data, { spaces: 2, ...options });
  } else {
    await fs.writeFile(filePath, data, options);
  }

  logInfo(`Saved file: ${filePath}`);
}

/**
 * Downloads binary assets (e.g., images, PDFs) from a list of URLs.
 * Uses native http/https modules.
 */
export async function downloadAssets(urls, target = 'unknown-target') {
  if (!urls || urls.length === 0) {
    console.warn('No assets to download.');
    return;
  }

  const downloadDir = path.resolve('downloads', target);
  await fs.ensureDir(downloadDir);

  const download = (url) => {
    return new Promise((resolve, reject) => {
      const { protocol } = parseUrl(url);
      const lib = protocol === 'https:' ? https : http;
      const fileName = path.basename(url.split('?')[0]);
      const filePath = path.join(downloadDir, fileName);
      const file = createWriteStream(filePath);

      lib.get(url, (response) => {
        if (response.statusCode !== 200) {
          return reject(new Error(`Failed to download ${url} (${response.statusCode})`));
        }

        response.pipe(file);
        file.on('finish', () => {
          file.close();
          logInfo(`Downloaded: ${filePath}`);
          resolve();
        });
      }).on('error', (err) => {
        fs.unlink(filePath, () => {});
        reject(err);
      });
    });
  };

  for (const url of urls) {
    try {
      await download(url);
    } catch (err) {
      console.error(`Failed to download ${url}: ${err.message}`);
    }
  }
}

/**
 * Helper to pull out image/pdf links from result objects.
 */
function extractAssetUrls(data) {
  const urls = [];

  for (const item of data) {
    for (const value of Object.values(item)) {
      if (typeof value === 'string' && /\.(png|jpe?g|pdf)$/.test(value)) {
        urls.push(value);
      }
    }
  }

  return urls;
}
