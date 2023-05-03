import puppeteer from "puppeteer";

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto("https://codepen.io/mishap/pen/yLRawYz?editors=1100");
})();
