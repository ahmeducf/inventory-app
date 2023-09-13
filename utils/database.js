const mongoose = require('mongoose');
const debug = require('debug')('inventory-app:database');

module.exports = async () => {
  const connectionString =
    process.env.MONGODB_URI || process.env.MONGODB_URI_DEV;

  try {
    await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    debug('Database connected');
  } catch (error) {
    console.error(error);
  }
};
