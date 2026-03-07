import { MongoClient } from "mongodb";

const globalForMongo = globalThis as unknown as {
  mongoClientPromise?: Promise<MongoClient>;
};

function getMongoUri() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not configured");
  }
  return uri;
}

export async function getMongoClient() {
  if (!globalForMongo.mongoClientPromise) {
    const client = new MongoClient(getMongoUri());
    globalForMongo.mongoClientPromise = client.connect();
  }

  return globalForMongo.mongoClientPromise;
}

export async function getMongoDb() {
  const client = await getMongoClient();
  const dbName = process.env.MONGODB_DB || "miniproject";
  return client.db(dbName);
}
