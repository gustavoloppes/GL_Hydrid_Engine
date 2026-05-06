/**
 * Usage: node screenshot.mjs <url> [label]
 * Example: node screenshot.mjs http://localhost:3000
 * Example: node screenshot.mjs http://localhost:3000 hero
 *
 * Saves to: ./temporary screenshots/screenshot-N.png
 * or:       ./temporary screenshots/screenshot-N-label.png
 *
 * Puppeteer install path (per CLAUDE.md):
 *   C:/Users/nateh/AppData/Local/Temp/puppeteer-test/
 * Chrome cache:
 *   C:/Users/nateh/.cache/puppeteer/
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const url   = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';

const screenshotDir = path.join(__dirname, 'temporary screenshots');
if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });

// Auto-increment: find next available N
const existing = fs.readdirSync(screenshotDir)
  .map(f => { const m = f.match(/^screenshot-(\d+)/); return m ? parseInt(m[1]) : 0; });
const next = existing.length ? Math.max(...existing) + 1 : 1;

const filename = label
  ? `screenshot-${next}-${label}.png`
  : `screenshot-${next}.png`;

const outPath = path.join(screenshotDir, filename);

const browser = await puppeteer.launch({
  headless: 'new',
  executablePath: 'C:/Users/New/.cache/puppeteer/chrome/win64-147.0.7727.57/chrome-win64/chrome.exe',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

// Force all scroll-reveal elements visible (IntersectionObserver doesn't fire during Puppeteer scroll)
await page.evaluate(() => {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
});
// Let transition animations complete
await new Promise(r => setTimeout(r, 900));

await page.screenshot({ path: outPath, fullPage: true });
await browser.close();

console.log(`Screenshot saved: ${outPath}`);
