const BaseParser = require('./BaseParser.js');
const random_useragent = require('random-useragent');
const axios = require('axios');
const cheerio = require('cheerio');

module.exports = class HTMLParserSingle extends BaseParser {
  constructor(options) {
    super(options);
    this.url = this.options.url;
  }

  async parse() {
    const response = await axios({
      method: 'get',
      url: this.url,
      headers: {
        'User-Agent': random_useragent.getRandom()
      }
    });
    const html = response.data;
    const $ = cheerio.load(html);
    let results = [];
    for (let [fieldName, selectorObj] of Object.entries(this.options.fieldSelectors)) {
      if (typeof selectorObj === 'string') {
        selectorObj = {
          selector: selectorObj,
          pattern: null,
          att: null
        }
      }
      let modifier  = 0;
      $(selectorObj.selector).each((i, elem) => {
        i += modifier;
        if (i > results.length - 1) {
          results.push({});
        }
        let tmpText = selectorObj.att ? $(elem).attr(selectorObj.att) : $(elem).text();
        if (selectorObj.skipEmpty && tmpText.trim() === '') {
          modifier--;
          return;
        }
        let matches;
        if (selectorObj.pattern) {
          matches = new RegExp(selectorObj.pattern).exec(tmpText);
          results[i][fieldName] = matches ? matches[1] : null;
        } else {
          results[i][fieldName] = tmpText;
        }
        if (selectorObj.replace) {
          selectorObj.replace.forEach((tuple) => {
            const [regexPatternStr, replaceWith] = tuple;
            results[i][fieldName] = results[i][fieldName].replace(new RegExp(regexPatternStr), replaceWith);
          });
        }
        if (fieldName === 'date') {
          results[i][fieldName] = new Date(results[i][fieldName]);
        }
      });
    }
  
    return results;
  }
};