import { MongoClient, ObjectId } from 'mongodb';

// Connection URL
const url = process.env.DATABASE_URL || 'mongodb://localhost:27017';
const dbName = 'chronic-tracker';

// Create a singleton MongoDB client
let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(url);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(url);
  clientPromise = client.connect();
}

// Export a module-scoped MongoClient promise
export { clientPromise, ObjectId };

// Helper function to get the database
export async function getDb() {
  const client = await clientPromise;
  return client.db(dbName);
}

// Helper function to get a collection
export async function getCollection(collectionName: string) {
  const db = await getDb();
  return db.collection(collectionName);
}

// SymptomLog type definition matching the Prisma schema
export interface SymptomLog {
  _id?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
  symptomText: string;
  painLevel: number;
  triggers: string[];
  userId?: string;
}
