import type { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

// Global MongoClient to reuse the connection in a serverless environment
let clientPromise: Promise<MongoClient>;

const uri = process.env.MONGODB_URI || '';  // Fallback for URI

if (!globalThis._mongoClientPromise) {
  // Create a new MongoClient instance
  const client = new MongoClient(uri);
  globalThis._mongoClientPromise = client.connect();
}
clientPromise = globalThis._mongoClientPromise;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      // Connect to the MongoDB client
      const client = await clientPromise;
      const database = client.db('musemate');
      const collection = database.collection('booking_details');

      // Insert booking details from the request body
      const result = await collection.insertOne(req.body);

      // Return a success response
      res.status(200).json({ message: 'Booking details saved successfully', data: result });
    } catch (error) {
      console.error('Error saving booking details:', error);
      res.status(500).json({ message: 'Error saving booking details', error });
    }
  } else {
    // Handle any other HTTP methods
    res.status(405).json({ message: 'Method not allowed' });
  }
}
