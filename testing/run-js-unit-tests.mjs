import { chromium } from 'playwright';

(async () => {
  const TEST_URL = 'http://127.0.0.1:8080/testing/js-unit-tests.html';

  const browser = await chromium.launch({
    headless: true,
    args: ['--autoplay-policy=no-user-gesture-required']
  });

  const page = await browser.newPage();

  page.on('console', msg => console.log(msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err));

  await page.goto(TEST_URL, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__testResults?.done === true, null, { timeout: 20000 });

  const results = await page.evaluate(() => window.__testResults);
  console.log(`Final: ${results.passed}/${results.total} passed, ${results.failed} failed`);

  await browser.close();
  if (results.failed > 0) process.exit(1);
})();