const createError = require('http-errors');
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const compression = require('compression');
const helmet = require('helmet');
const path = require('path');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/user');
const categoriesRouter = require('./routes/category');
const itemsRouter = require('./routes/item');

const config = require('./config');
const logger = require('./utils/logger');
const db = require('./utils/database');
const { localStrategy, serializer, deserializer } = require('./utils/passport');
const limiter = require('./utils/rate_limit');

require('dotenv').config();

const app = express();

config(app);

db();

app.use(logger());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      mongoOptions: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
      ttl: 24 * 60 * 60,
      collectionName: 'sessions',
    }),
  }),
);

passport.use(localStrategy);
passport.serializeUser(serializer);
passport.deserializeUser(deserializer);

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;

  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(compression());
app.use(helmet());
app.use(limiter);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/categories', categoriesRouter);
app.use('/items', itemsRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
