const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
// const { setupModels } = require('../../src/model');

let mongod;
const setupMongoMemoryServer = async () => {
  mongod = await MongoMemoryServer.create();
  const uri = await mongod.getUri();

  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    connectTimeoutMS: 3000,
    serverSelectionTimeoutMS: 3000,
  });
  // await setupModels();
};

// const stopServer = async () => {
//   await mongoose.disconnect();
//   await mongod.stop();
// };

module.exports = {
  // stopServer,
  setupMongoMemoryServer,
};
