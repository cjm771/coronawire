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
        const parserResults = await parser.parse();
        result = [...result, ...parserResults];
      } catch (e) {
        res.errorJSON({
          "parser": source.parser.type,
          "source": source.name + " - " + source.locale,
          "message": String(e),
        });
      }
    }
  };
  res.sendJSON({ locale: userLocale.region, result: result });
};