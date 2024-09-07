import type { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';  // For hashing passwords
import jwt from 'jsonwebtoken';  // For token-based authentication

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

// Global MongoClient to reuse the connection in a serverless environment
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

const uri = process.env.MONGODB_URI || '';
const options = {};  // Remove deprecated options

if (process.env.NODE_ENV === 'development') {
  // In development mode, use globalThis to store the client promise
  if (!globalThis._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalThis._mongoClientPromise = client.connect();
  }
  clientPromise = globalThis._mongoClientPromise;
} else {
  // In production, create a new MongoClient instance for each request
  clientPromise = MongoClient.connect(uri, options);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { name, email, password, type } = req.body;

      if (!email || !password || !type) {
        return res.status(400).json({ message: 'Email, password, and type are required' });
      }

      const client = await clientPromise;
      const database = client.db('musemate');
      const collection = database.collection('registrations');

      if (type === 'signup') {
        // Check if user already exists
        const userExists = await collection.findOne({ email });
        if (userExists) {
          return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);  // Use a salt rounds of 12

        // Insert new user
        const result = await collection.insertOne({ name, email, password: hashedPassword });
        res.status(201).json({ message: 'Signup successful', data: result });

      } else if (type === 'login') {
        // Check if user exists
        const user = await collection.findOne({ email });
        if (!user) {
          return res.status(400).json({ message: 'User not found' });
        }

        // Compare passwords
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
          return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign({ email }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '1h' });

        res.status(200).json({ message: 'Login successful', token, redirectUrl: '/chatbot' });
      } else {
        res.status(400).json({ message: 'Invalid request type' });
      }
    } catch (error) {
      console.error('Error processing request:', error);
      res.status(500).json({ message: 'Error processing request', error });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
