import { MongoClient } from 'mongodb';

const DB_NAME = 'great_heist';

/**
 * Global cache across serverless warm invocations.
 * In serverless environments like Vercel, module-level variables
 * remain in memory between executions on the same container instance.
 */
let cachedClient = null;
let cachedDb = null;
let cachedPromise = null;

/**
 * Connects to MongoDB with connection caching for serverless execution.
 * Reuses existing client and database connections across function invocations.
 *
 * @returns {Promise<{ client: MongoClient, db: import('mongodb').Db }>}
 */
export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable inside your environment configuration.');
  }

  if (!cachedPromise) {
    const client = new MongoClient(uri);
    cachedPromise = client.connect().then((connectedClient) => {
      cachedClient = connectedClient;
      cachedDb = connectedClient.db(DB_NAME);
      return { client: cachedClient, db: cachedDb };
    });
  }

  return cachedPromise;
}

export default connectToDatabase;
