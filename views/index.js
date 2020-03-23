const moment = require('moment');
const LocaleService = require('../services/LocaleService.js');

const parsers = {
  BaseParser: require('../parsers/BaseParser.js'),
  HTMLParserSingle: require('../parsers/HTMLParserSingle.js'),
  HTMLParserMulti: require('../parsers/HTMLParserMulti.js'),
  TwitterParser: require('../parsers/TwitterParser.js')
};

const sources = {
  national: require('../sources/national/national.json'),
  local: {
    bayArea: require('../sources/local/bay-area.json'),
    newYork: require('../sources/local/new-york.json')
  }
};

module.exports = async (req, res) => {
  const userLocale = await LocaleService.getLocale(req, res);
  const sourcesFiltered = [...sources.national, ...sources.local[userLocale.region]];
  let result = [];
  for (source of sourcesFiltered) {
    if (source.disabled) {
      continue;
    }
    if (parsers[source.parser.type]) {
      const parser = new (parsers[source.parser.type] || parsers.BaseParser)(source.parser);
      try {
        let parserResults = await parser.parse();
        parserResults = parserResults.map((result) => {
          result.source = source;
          return result;
        })
        result = [...result, ...parserResults];
      } catch (e) {
        result = {
          "error": true,
          "parser": source.parser.type,
          "source": source.name + " - " + source.locale,
          "message": String(e),
          "errorDetail": JSON.stringify({...e})
        };
      }
    }
  };

  if (!result.error) {
    result = result.sort((a, b) => {
      return b.date.getTime() - a.date.getTime()
    });
  }

  res.render('index', {
    layout: false,
    locale: userLocale.region, 
    result: result,
    sources: sourcesFiltered,
    availableLocales: LocaleService.getAvailableLocaleNames(),
    helpers: {
      selectedTextIfSet: (a) => {
        return a === userLocale.region ? 'selected' : ''
      },
      camelToDisplayCase: (val) => {
        return val.replace(/^(.)(.+)/, (m, m1, m2) => {
          return `${m1.toUpperCase()}${m2}`;
        }).replace(/([A-Z])/g, (m, m1) => {
          return ` ${m1}`;
        }).trim();
      },  
      humanizeDate: (date) => {
        const pieces = moment(date).fromNow().split(' ');
        return `<b>${pieces[0] === 'a' ? 1 : pieces[0]}</b> ${pieces[1]} ago`
      },
      getDisplaySourceSubName: (source) => {
        if (source.parser.type === 'TwitterParser') {
          return `(${source.name})`;
          } else {
            return source.nickname ? `(${source.name})` : ''; 
          }
      },
      getSourceBadgeClass: (source) => {
        if (source.locale.toLowerCase() === 'national') {
          return 'locale--national';
        } else if (source.locale.toLowerCase() === 'global') {
          return 'locale--global';
        } else {
          return 'locale--local';
        }
      },
      getDisplaySourceName: (source) => {
        if (source.parser.type === 'TwitterParser') {
        return `@${source.parser.handle}`;
        } else {
          return source.nickname ? source.nickname : source.name; 
        }
      },
      getDisplaySourceURL: (source) => {
        if (source.parser.type === 'TwitterParser') {
        return `http://twitter.com/${source.parser.handle}`;
        } else {
          return source.parser.url; 
        }
      }
    }
  })
};