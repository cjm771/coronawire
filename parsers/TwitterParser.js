
require('dotenv').config();
const Twitter = require('twitter');
const BaseParser = require('./BaseParser.js');

const client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

module.exports = class TwitterParser extends BaseParser {
  constructor(options) {
    super(options);
    this.twitterHandle = this.options.handle;
  }

  async parse() {
    try {
      items = await client.get('statuses/user_timeline', { screen_name: this.twitterHandle, count: 50 });
      return items;
    } catch (e) {
      throw e;
    }
  }
};