/*
 * Capture ACTUAL app screenshots from a running local Doctors Tracker.
 * Use a test MongoDB database containing only fictional doctor/patient records.
 *
 * Prerequisites:
 *   npm install --no-save playwright
 *   npx playwright install chromium
 *   SCREENSHOT_EMAIL=... SCREENSHOT_PASSWORD=... SCREENSHOT_TEST_DATA_ONLY=1 npm run screenshots
 */
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

if (process.env.SCREENSHOT_TEST_DATA_ONLY !== "1") {
  console.error("Refusing screenshots until SCREENSHOT_TEST_DATA_ONLY=1 is set and fictional test records are used.");
  process.exit(1);
}
const email = process.env.SCREENSHOT_EMAIL;
const password = process.env.SCREENSHOT_PASSWORD;
if (!email || !password) {
  console.error("Set SCREENSHOT_EMAIL and SCREENSHOT_PASSWORD for a demo account with role=admin.");
  process.exit(1);
}

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  console.error("Install Playwright locally: npm install --no-save playwright && npx playwright install chromium");
  process.exit(1);
}

const baseURL = process.env.SCREENSHOT_BASE_URL || "http://localhost:3000";
const dest = resolve("docs/screenshots");
await mkdir(dest, {recursive:true});
const browser = await chromium.launch({headless:true});
const desktop = await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1});
const desktopPage = await desktop.newPage();

async function capture(page, route, file, readySelector) {
  await page.goto(baseURL + route, {waitUntil:"networkidle"});
  if (!page.url().includes(route)) throw new Error("Expected " + route + " but opened " + page.url());
  if (readySelector) await page.locator(readySelector).first().waitFor({state:"visible"});
  await page.screenshot({path:resolve(dest,file),fullPage:true});
  console.log("Saved " + file);
}

try {
  await capture(desktopPage, "/", "login-desktop.png", 'input[type="email"]');
  await desktopPage.locator('input[type="email"]').fill(email);
  await desktopPage.locator('input[type="password"]').fill(password);
  await desktopPage.locator('button[type="submit"]').click();
  await desktopPage.waitForURL(url => url.pathname === "/dashboard", {timeout:25000});
  await capture(desktopPage, "/dashboard", "dashboard-desktop.png", "main");
  await capture(desktopPage, "/doctors", "doctors-desktop.png", "table");
  await capture(desktopPage, "/patients", "patients-desktop.png", "table");

  const mobile = await browser.newContext({
    viewport:{width:390,height:844},
    deviceScaleFactor:2,
    isMobile:true,
    hasTouch:true,
    storageState:await desktop.storageState()
  });
  const mobilePage=await mobile.newPage();
  await capture(mobilePage, "/dashboard", "dashboard-mobile.png", "main");
  await capture(mobilePage, "/patients", "patients-mobile.png", "table");
  await mobile.close();
} finally {
  await browser.close();
}
