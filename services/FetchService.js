
const axios = require('axios');
const cheerio = require('cheerio');
const random_useragent = require('random-useragent');
const puppeteer = require('puppeteer');

module.exports = {
  fetchAndLoad : async (url, dynamic) => {
    let content;
    if (dynamic) {
      const browser = await puppeteer.launch({ args: ['--no-sandbox']});
      const page =  await browser.newPage();
      await page.setUserAgent(random_useragent.getRandom());
      await page.goto(url);
      content = await page.content();
    } else {
      const  response = await axios({
        method: 'get',
        url: url,
        headers: {
          'User-Agent': random_useragent.getRandom()
        }
      });
      content = response.data;
    }
    return cheerio.load(content);
  },
}