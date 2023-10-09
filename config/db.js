const mongoose = require('mongoose');

mongoose
  .connect('mongodb://localhost:27017/finalDB', {

  })
  .then(() => {
    console.log('Connected to db successfully...');
  })
  .catch((err) => {
    console.error('Error connecting to db:', err);
  });

module.exports = mongoose.connection;
