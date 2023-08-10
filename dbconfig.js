const mongoose = require('mongoose');


const ConnectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL,{ useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to the database');
  } catch (error) {
    console.error('Failed to connect to the database', error);
  }
};

module.exports = ConnectDB;