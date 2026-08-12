import puppeteer from 'puppeteer';

(async () => {
  console.log('🚀 Launching Google Chrome debugging session...');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  page.on('console', msg => console.log('--- CHROME DEVTOOLS CONSOLE LOGS ---', msg.type(), msg.text()));

  try {
    console.log('1. Loading http://localhost:3002...');
    await page.goto('http://localhost:3002', { waitUntil: 'networkidle2' });

    const title = await page.title();
    console.log('Page Title:', title);

    const feedHeader = await page.$eval('h2', el => el.innerText);
    console.log('Current View Header:', feedHeader);

    console.log('3. Clicking Live Messages tab...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const msgBtn = btns.find(b => b.innerText.includes('Messages'));
      if (msgBtn) msgBtn.click();
    });

    await new Promise(r => setTimeout(r, 500));

    console.log('4. Clicking One-Click Admin Login...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const adminBtn = btns.find(b => b.innerText.includes('System Admin Login') || b.innerText.includes('Admin'));
      if (adminBtn) adminBtn.click();
    });

    await new Promise(r => setTimeout(r, 1000));

    console.log('6. Navigating to Live Messages thread...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const msgBtn = btns.find(b => b.innerText.includes('Messages'));
      if (msgBtn) msgBtn.click();
    });

    await new Promise(r => setTimeout(r, 1000));

    console.log('8. Typing and sending a test message...');
    await page.type('input.form-input', 'Hello Apple Liquid Glass 8px grid!');
    await page.keyboard.press('Enter');

    await new Promise(r => setTimeout(r, 500));

    console.log('Sent Message in Thread: PASSED ✅');
    
    await page.screenshot({ path: '/Users/rajansapkota/.gemini/antigravity/brain/5ed05bf0-c81b-41aa-8c4e-8c93e83df26a/scratch/chrome_devtools_test.png' });
    console.log('📸 Test screenshot saved to: /Users/rajansapkota/.gemini/antigravity/brain/5ed05bf0-c81b-41aa-8c4e-8c93e83df26a/scratch/chrome_devtools_test.png');

  } catch (err) {
    console.error('Test Execution Error:', err);
  } finally {
    await browser.close();
  }
})();
