
require('dotenv').config();
const axios = require('axios');
const locales = [
  {
    region: 'bayArea',
    location: [37.8272, 122.2913],
  },
  {
    region: 'newYork',
    location: [40.7128, 74.0060],
  },
]


const distance = (lat1, lon1, lat2, lon2, unit) => {
  var radlat1 = Math.PI * lat1/180
  var radlat2 = Math.PI * lat2/180
  var theta = lon1-lon2
  var radtheta = Math.PI * theta/180
  var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  if (dist > 1) {
      dist = 1;
  }
  dist = Math.acos(dist)
  dist = dist * 180/Math.PI
  dist = dist * 60 * 1.1515
  if (unit=="K") { dist = dist * 1.609344 }
  if (unit=="N") { dist = dist * 0.8684 }
  return dist
};

module.exports = {
  getAvailableLocaleNames: () => {
    return locales.map((locale) => {
      return locale.region;
    })
  },
  getLocale : async (req, res) => {
    if (process.env.NODE_ENV === 'development') {
      return locales[0];
    }
    if (req.cookies.locale) {
      const exists = locales.filter((locale) => {
        return locale.region === req.cookies.locale;
      });
      if (exists.length) {
        return exists[0];
      } else {
        res.clearCookie('locale');
      }
    }
    try {
      const  response = await axios({
        method: 'get',
        url: `http://api.ipstack.com/${req.ipInfo.error ? process.env.DEV_IP : req.ipInfo.ip}?access_key=${process.env.IPSTACK_API_KEY}&format=1`
      });
      content = response.data;
      let closestLocale = locales[0];
      let shortestDist = null;
      for (locale of locales) {
        const newDist = distance(locale.location[0], locale.location[1], content.latitude, content.longitude);
        if (!shortestDist || newDist < shortestDist) {
          closestLocale = locale;
          shortestDist = newDist;
        }
      }
      res.cookie('locale', closestLocale.region);
      return closestLocale;
    } catch (e) {
      console.log('could not assign..', e);
      return locales[0];
    }
  }
};