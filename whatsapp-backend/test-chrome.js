/**
 * Chrome Test Script
 * Tests if Chrome/Chromium is working properly in Docker container
 */

const puppeteer = require('puppeteer');

async function testChrome() {
  console.log('🧪 Testing Chrome/Chromium in Docker container...');

  try {
    // Launch browser with Docker-optimized settings
    const browser = await puppeteer.launch({
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser',
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection',
        '--disable-extensions',
        '--disable-plugins',
        '--disable-blink-features=AutomationControlled',
        '--no-default-browser-check',
        '--disable-default-apps',
        '--disable-popup-blocking',
        '--disable-translate',
        '--disable-background-networking',
        '--disable-sync',
        '--disable-background-downloads',
        '--disable-client-side-phishing-detection',
        '--disable-component-update',
        '--disable-domain-reliability',
        '--disable-features=AudioServiceOutOfProcess',
        '--disable-hang-monitor',
        '--memory-pressure-off',
        '--max_old_space_size=4096',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--remote-debugging-port=9222',
        '--remote-debugging-address=0.0.0.0'
      ],
      timeout: 120000,
      protocolTimeout: 120000,
      ignoreDefaultArgs: ['--disable-extensions'],
      defaultViewport: {
        width: 1280,
        height: 720
      }
    });

    console.log('✅ Chrome launched successfully!');

    // Create a new page
    const page = await browser.newPage();
    console.log('✅ New page created successfully!');

    // Navigate to a simple page
    await page.goto('https://www.google.com', { waitUntil: 'networkidle2' });
    console.log('✅ Successfully navigated to Google!');

    // Get page title
    const title = await page.title();
    console.log(`📄 Page title: ${title}`);

    // Close browser
    await browser.close();
    console.log('✅ Browser closed successfully!');

    console.log('🎉 Chrome test completed successfully!');
    return true;

  } catch (error) {
    console.error('❌ Chrome test failed:', error);
    console.error('🔍 Error details:', error.message);
    return false;
  }
}

// Run the test
testChrome().then(success => {
  if (success) {
    console.log('🚀 Chrome is ready for Venom Bot!');
    process.exit(0);
  } else {
    console.log('🚨 Chrome needs to be fixed before running Venom Bot');
    process.exit(1);
  }
});
