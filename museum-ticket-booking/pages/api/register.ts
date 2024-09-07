import type { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

// Global MongoClient to reuse the connection in a serverless environment
let clientPromise: Promise<MongoClient>;

const uri = process.env.MONGODB_URI || '';  // Fallback for URI

if (!globalThis._mongoClientPromise) {
  // Create a new MongoClient instance without deprecated options
  const client = new MongoClient(uri);
  globalThis._mongoClientPromise = client.connect();
}
clientPromise = globalThis._mongoClientPromise;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { name, email, password } = req.body;

      // Connect to MongoDB
      const client = await clientPromise;
      const database = client.db('musemate');
      const collection = database.collection('registrations');

      // Check if user with the same email already exists
      const existingUser = await collection.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Insert new user
      const result = await collection.insertOne({
        name,
        email,
        password: hashedPassword,
      });

      res.status(200).json({ message: 'User registered successfully', data: result });
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json({ message: 'Error registering user', error });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
