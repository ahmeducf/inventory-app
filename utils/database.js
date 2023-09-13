const mongoose = require('mongoose');
const debug = require('debug')('inventory-app:database');

module.exports = async () => {
  const connectionString = process.env.MONGODB_URI_DEV;

  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    debug('Database connected');
  } catch (error) {
    console.error(error);
  }
};
