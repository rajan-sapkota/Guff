import { test, expect } from '@playwright/test';

test('Verify Login, Tab Protection, and Message Input on Guff App', async ({ page }) => {
  const logs = [];
  page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => logs.push(`[PAGE ERROR] ${err.message}`));

  console.log('1. Navigating to http://localhost:3002...');
  await page.goto('http://localhost:3002', { waitUntil: 'networkidle' });

  // Verify Title
  await expect(page).toHaveTitle(/Guff/);

  // Unauthenticated user should see Social Feed by default
  console.log('2. Checking public feed view...');
  await expect(page.locator('text=Social Guff Feed')).toBeVisible();

  // Try clicking Live Messages (protected route) -> Should open Auth Modal
  console.log('3. Clicking Live Messages while logged out...');
  const chatTab = page.locator('button:has-text("Live Messages")').first();
  await chatTab.click();

  // Verify Auth Modal appears with prompt
  console.log('4. Verifying Auth Modal prompt...');
  await expect(page.locator('.modal-content')).toBeVisible();
  await expect(page.locator('text=Please sign in or register to access Live Messaging channels.')).toBeVisible();

  // Perform One-Click Admin Login
  console.log('5. Clicking One-Click Admin Login...');
  const adminBtn = page.locator('text=One-Click Admin Login');
  await adminBtn.click();

  // Wait for login state update
  await page.waitForTimeout(1000);

  // Verify logged in header
  console.log('6. Verifying logged in user state...');
  await expect(page.locator('text=System Admin')).toBeVisible();

  // Click Live Messages tab now that user is logged in
  console.log('7. Switching to Live Messages tab...');
  await chatTab.click();

  // Verify Chat Window header and Pinned Message Input Box
  console.log('8. Verifying #general channel and Message Input Box...');
  await expect(page.locator('text=#general')).toBeVisible();
  const messageInput = page.locator('input[placeholder="Type a live message or share a recommendation..."]');
  await expect(messageInput).toBeVisible();

  // Send a test message
  console.log('9. Sending test message...');
  await messageInput.fill('Automated test message from Playwright execution!');
  const sendBtn = page.locator('button[type="submit"]:has(svg.lucide-send)');
  await sendBtn.click();
  await page.waitForTimeout(500);

  // Verify sent message appears in chat list
  console.log('10. Verifying sent message in chat thread...');
  await expect(page.locator('text=Automated test message from Playwright execution!')).toBeVisible();

  console.log('\n--- BROWSER CONSOLE LOGS ---');
  console.log(logs.join('\n'));
});
