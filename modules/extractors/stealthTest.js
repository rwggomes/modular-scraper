

export async function scrapeStealthTest(page, argv) {
  const url = 'https://bot.sannysoft.com/';

  console.log(`Navigating to ${url} to test stealth...`);
  await page.goto(url, { waitUntil: 'networkidle2' });

  if (argv.screenshot) {
    const fileName = `stealth-test-${Date.now()}.png`;
    await page.screenshot({ path: fileName, fullPage: true });
    console.log(`Screenshot saved as ${fileName}`);
  }

  return [{ success: true, url }];
}
