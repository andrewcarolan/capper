#!/usr/bin/env node

import puppeteer from "puppeteer";
import * as fs from "fs";
import { URL } from "url";

const createImagePath = (s) => `${OUTPUT_DIR}/${s.replace(/\./g, "")}.png`;

let [, , debugOrFirstSelector, ...selectors] = process.argv;

const DEBUG = debugOrFirstSelector === "--debug";
if (!DEBUG) {
  selectors = [debugOrFirstSelector, ...selectors];
}

if (!selectors.length) {
  console.error("Please provide at least one selector.");
  process.exit(1);
}

const SERVER_URL = "http://localhost:3000";
const OUTPUT_DIR = "images";

const outputPath = new URL("../images", import.meta.url);

try {
  fs.mkdirSync(outputPath);
} catch (error) {}

try {
  fs.accessSync(outputPath, fs.constants.W_OK);
} catch (error) {
  console.error(`Can't write to output directory: ${error}`);
  process.exit(1);
}

const capture = async () => {
  const browser = await puppeteer.launch({ headless: !DEBUG });
  const page = await browser.newPage();

  await page.goto(SERVER_URL);

  await page.evaluate(() => {
    document.body.classList.add("capturing");
  });

  for (const selector of selectors) {
    const path = createImagePath(selector);
    const element = await page.$(selector);

    if (!element) {
      console.error(`Couldn't find element matching selector: ${selector}`);
      continue;
    }

    await element.screenshot({
      path,
      omitBackground: true,
    });

    console.log(`Wrote image of element matching ${selector} to ${path}`);
    await element.dispose();
  }

  await browser.close();
};

capture();
