const sources = require('../sources/main.json');

const parsers = {
  HTMLParserSingle: require('../parsers/HTMLParserSingle.js'),
  HTMLParserMulti: require('../parsers/HTMLParserMulti.js'),
  TwitterParser: require('../parsers/TwitterParser.js')
};

module.exports = (req, res) => {
  const result = [];
  for (source of sources) {
    console.log(source);
  };
  res.sendJSON(result);
};