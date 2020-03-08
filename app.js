const express = require('express');
const logger = require('morgan');
const http = require('http');
var createError = require('http-errors');
var path = require('path');

const InitDb = require('./db').initDb;
const fetchRecords = require('./main').fetchRecords;

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);
app.set('port', port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
const server = http.createServer(app);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  next(createError(404));
});

InitDb().then(db => {
  const indexRouter = require('./routes/index')(db);
  app.use('/', indexRouter);
  fetchRecords(db).then(y => {
    console.log('Records Updated');
    server.listen(port);
  });
});
