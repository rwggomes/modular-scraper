import fs from 'fs-extra';
import { format } from 'date-fns';
import { logInfo } from './logger.js';

export async function saveResults(data, target = 'results') {
  const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
  const folder = 'output';

  // Make sure the output folder exists
  await fs.ensureDir(folder);

  // Build dynamic filename
  const filename = `${target}-${timestamp}.json`;
  const fullPath = `${folder}/${filename}`;

  // Save file
  await fs.writeJson(fullPath, data, { spaces: 2 });
  logInfo(`Saved ${data.length} items to ${fullPath}`);
}
