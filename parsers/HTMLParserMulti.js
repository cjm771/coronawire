const BaseParser = require('./BaseParser.js');
const HTMLParserSingleParser = require('./HTMLParserSingle.js');
const puppeteer = require('puppeteer');

const FetchService = require('../services/FetchService.js');


module.exports = class HTMLParserMulti extends BaseParser {
  constructor(options) {
    super(options);
    this.url = this.options.url;
    this.linkSelector = this.options.linkSelector;
  }

  async parse() {
    const $ = await FetchService.fetchAndLoad(this.url, this.options.dynamic);
    let results = [];

    const hrefs = [];
    $(this.linkSelector).each((i, elem) => {
      hrefs.push($(elem).attr('href'));
    });
    for (let href of hrefs) {
      const newResults = await new HTMLParserSingleParser({
        ...this.options,
        url: href
      }).parse();
      results = [...results, ...newResults];
    }
    return results;
  }
};