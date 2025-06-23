import fs from 'fs-extra';
import path from 'path';
import { format as formatDate } from 'date-fns';
import { logInfo } from './logger.js';
import pkg from 'csv-writer';

const { createObjectCsvWriter } = pkg;

export async function saveResults(data, format = 'json', _outputPath = '', target = 'results') {
  if (!data || data.length === 0) {
    console.warn('No data to save.');
    return;
  }

  // Always write to 'output/{target}-{timestamp}.{format}'
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
    await fs.writeJson(outputPath, data, { spaces: 2 });
  }

  logInfo(`Saved ${data.length} items to ${outputPath}`);
}
