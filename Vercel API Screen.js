const puppeteer = require('puppeteer');
const VIEWPORT_WIDTH = 1280; // Desired width of the viewport
const VIEWPORT_HEIGHT = 720; // Desired height of the viewport
const DEVICE_SCALE_FACTOR = 2; // Device scale factor for HD resolution

module.exports = async (req, res) => {
  const URL = req.query.url; // Get the URL from the query parameter

  if (!URL) {
    res.status(400).send('URL query parameter is required');
    return;
  }

  try {
    const browser = await puppeteer.launch({
      executablePath: process.env.CHROME_EXECUTABLE_PATH,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    await page.goto(URL, { waitUntil: 'networkidle2' });

    await page.evaluate(() => {
      const elements = document.querySelectorAll('[class*="cookie"]');
      for (let element of elements) {
        element.style.display = 'none';
      }
    });

    await page.waitForTimeout(1000);

    await page.setViewport({
      width: VIEWPORT_WIDTH,
      height: VIEWPORT_HEIGHT,
      deviceScaleFactor: DEVICE_SCALE_FACTOR
    });

    const screenshot = await page.screenshot({ fullPage: true });

    await browser.close();

    res.setHeader('Content-Type', 'image/png');
    res.send(screenshot);
  } catch (error) {
    console.log('An error occurred: ', error.message);
    res.status(500).send(`An error occurred: ${error.message}`);
  }
};
