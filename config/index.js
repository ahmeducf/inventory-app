const { setViewEngine } = require('./view');

module.exports = (app) => {
  setViewEngine(app);
  app.set('trust proxy', 1);
};
