// pages/api/register.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      await client.connect();
      const database = client.db('musemate');
      const collection = database.collection('registrations');
      
      const { name, email, password } = req.body;

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      const result = await collection.insertOne({
        name,
        email,
        password: hashedPassword,
      });

      res.status(200).json({ message: 'User registered successfully', data: result });
    } catch (error) {
      res.status(500).json({ message: 'Error registering user', error });
    } finally {
      await client.close();
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
