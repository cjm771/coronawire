
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
      const items = await client.get('statuses/user_timeline', { screen_name: this.twitterHandle, count: 50 });
      return items.filter((item) => {
        if (this.options.mustContainKeyword && this.options.mustContainKeyword.length) {
          let found = false;
          this.options.mustContainKeyword.forEach((keyword) => {
            if (item.text.indexOf(keyword) !== -1) {
              found = true;
            }
          })
          return found;
        } else {
          return true;
        }
      }).map((item) => {
        let url = item.entities.urls.length ? item.entities.urls[0].url : null;
        let originalAuthor = undefined;
        if (item.retweeted_status) {
          originalAuthor =  {
            date: new Date(item.retweeted_status.created_at),
            url: item.retweeted_status.entities.urls.length ? item.retweeted_status.entities.urls[0].url : null,
            author: {
              name: item.retweeted_status.user.name, 
              nickname: '@' + item.retweeted_status.user.screen_name
            }
          };
          url = originalAuthor.url;
        }
        return {
          description: item.text,
          date: new Date(item.created_at),
          url: item.entities.urls.length ? item.entities.urls[0].url : null,
          originalAuthor: originalAuthor
        }
      });
    } catch (e) {
      throw e;
    }
  }
};