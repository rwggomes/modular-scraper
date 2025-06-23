import { logWarn, logInfo } from './logger.js';// modules/retry.js
export async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  let delay = baseDelay;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn(); // Try the operation
    } catch (err) {
      if (attempt === maxRetries) throw err;

      

      logWarn(`Attempt ${attempt} failed: ${err.message}`);
      logInfo(`Retrying in ${delay}ms...\n`);

      await new Promise(res => setTimeout(res, delay));

      delay *= 2; // exponential backoff
    }
  }
}
