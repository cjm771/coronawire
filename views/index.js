const sources = require('../sources/main.json');

const parsers = {
  HTMLParserSingle: require('../parsers/HTMLParserSingle.js'),
  HTMLParserMulti: require('../parsers/HTMLParserMulti.js'),
  TwitterParser: require('../parsers/TwitterParser.js')
};

module.exports = async (req, res) => {
  let result = [];
  for (source of sources) {
    console.log(source);
    if (parsers[source.parser.type]) {
      const parser = new parsers[source.parser.type](source.parser);
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
  res.sendJSON(result);
};