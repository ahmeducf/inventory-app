const path = require('path');

exports.setViewEngine = (app) => {
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'pug');
};
