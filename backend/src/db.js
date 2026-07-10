const { MongoClient } = require('mongodb');

let client;
let database;

async function getDb() {
  if (database) {
    return database;
  }

  const connectionString = process.env.MONGODB_URI;
  if (!connectionString) {
    throw new Error('Missing MONGODB_URI environment variable.');
  }

  const databaseName = process.env.MONGODB_DB || 'bloom_blink';
  client = new MongoClient(connectionString);
  await client.connect();
  database = client.db(databaseName);
  return database;
}

async function closeDb() {
  if (client) {
    await client.close();
    client = undefined;
    database = undefined;
  }
}

module.exports = {
  getDb,
  closeDb,
};
