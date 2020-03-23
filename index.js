require('dotenv').config();
const path = require('path');
const express = require("express");
const exphbs = require('express-handlebars');
const expressStaticGzip = require("express-static-gzip");
const expressip = require('express-ip');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000;

const indexView = require('./views/index.js');

const app = express();
app.use(cookieParser())
app.use(expressip().getIpInfoMiddleware);
app.use(bodyParser.urlencoded({ extended: true }));
app.engine('.html', exphbs({extname: '.html'}));
app.set('views', path.resolve(__dirname, 'client/dist/'));
app.set('view engine', '.html');

app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.url} `);
  res.sendJSON = (data) => {
    res.status(200).end(JSON.stringify({data}));
  };
  res.errorJSON = (error, status = 400) => {
    res.status(status).end(JSON.stringify({error}));
  };
  next();
});

app.get('/', indexView);

app.use('/', expressStaticGzip(path.resolve(__dirname, 'client/dist'), {
  enableBrotli: true,
  orderPreference: ['br', 'gz'],
  setHeaders: function (res, path) {
    res.setHeader("Cache-Control", "public, max-age=31536000");
  }
}));

app.listen(PORT, () => {
  console.log(`Server is listening on port: ${PORT}`);
});
