import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.157 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36",
];

const scrapeImages = async (query) => {
  try {
    console.log("running image search for ", query, "...");
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    // Set random user agent
    const randomNumber = Math.floor(Math.random() * userAgents.length);
    await page.setUserAgent(userAgents[randomNumber]);

    await page.goto(`https://www.google.com/search?tbm=isch&q=${query}`, {
      waitUntil: "networkidle2",
    });

    // Scroll to the bottom of the page to load more images
    await page.evaluate(async () => {
      for (let i = 0; i < 10; i++) {
        window.scrollBy(0, window.innerHeight);
        await new Promise((resolve) => setTimeout(resolve, 500)); // Wait for more images to load
      }
    });
    // Wait for images to be loaded
    await page.waitForSelector("img", { visible: true, timeout: 20000 });

    // Extract full-size image URLs by accessing the parent anchor tag's href attribute
    const images = await page.evaluate(() => {
      const imageElements = document.querySelectorAll("img");
      const urls = [];
      imageElements.forEach((img) => {
        const url = img.src || img.dataset.src;
        if (url && url.startsWith("http") && !url.includes("google")) {
          urls.push(url);
        }
      });
      return urls.slice(0, 10);
    });

    await browser.close();
    console.log("images", images);
    return images;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getImage = async (name, type) => {
  const query = `${name}+${type}`;
  const images = await scrapeImages(query);

  if (images.length === 0) {
    console.log("running backup image search for ", type, "...");
    const backUpImages = await scrapeImages(type);
    if (backUpImages.length > 0) {
      const randomIndex = Math.floor(Math.random() * backUpImages.length);
      const randomImage = backUpImages[randomIndex];
      console.log("random image from backup", randomImage);
      return randomImage;
    }

    console.error("No images found");
    return null;
  }

  const randomIndex = Math.floor(Math.random() * images.length);
  const randomImage = images[randomIndex];
  console.log("random image", randomImage);
  return randomImage;
};
