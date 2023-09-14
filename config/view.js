const path = require('path');

exports.setViewEngine = (app) => {
  app.set('views', path.join(process.cwd(), 'views'));
  app.set('view engine', 'pug');
};
