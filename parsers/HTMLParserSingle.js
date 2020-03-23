const BaseParser = require('./BaseParser.js');
const FetchService = require('../services/FetchService.js');


module.exports = class HTMLParserSingle extends BaseParser {
  constructor(options) {
    super(options);
    this.url = this.options.url;
  }

  async parse() {
    const $ = await FetchService.fetchAndLoad(this.url);
    const results = [];
    let useActualUrl = false;

    for (let [fieldName, selectorObj] of Object.entries(this.options.fieldSelectors)) {
      let modifier  = 0;

      if (typeof selectorObj === 'string') {
        selectorObj = {
          selector: selectorObj,
          pattern: null,
          att: null
        }
      }
      
      if (fieldName === 'url' && selectorObj.selector === '{{this}}') {
        useActualUrl = true;
        continue;
      }

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
          debugger;
          matches = new RegExp(selectorObj.pattern).exec(tmpText);
          if (matches)
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
        if (fieldName === 'description') {
          debugger;
          results[i][fieldName] = (results[i][fieldName] && results[i][fieldName].length > 128) ? results[i][fieldName].slice(0, 125) + '...' : results[i][fieldName];
        }
      });
    }

    if (useActualUrl) {
      results.forEach((result) => {
        result.url = this.url;
      })
    }
  
    return results.filter((item) => {
      if (this.options.mustContainKeyword && this.options.mustContainKeyword.length) {
        let found = false;
        this.options.mustContainKeyword.forEach((keyword) => {
          if (item.text.indexOf(keyword) !== -1) {
            found = true;
          }
        });
        return found;
      } else {
        return true;
      }
    });
  }
};