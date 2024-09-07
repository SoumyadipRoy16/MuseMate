// /pages/api/auth.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { MongoClient } from 'mongodb'
import bcrypt from 'bcrypt'  // For hashing passwords
import jwt from 'jsonwebtoken'  // For token-based authentication

const uri = process.env.MONGODB_URI || '';
const client = new MongoClient(uri);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      await client.connect();
      const database = client.db('musemate');
      const collection = database.collection('registrations');

      const { name, email, password, type } = req.body;

      if (type === 'signup') {
        // Check if user already exists
        const userExists = await collection.findOne({ email });
        if (userExists) {
          return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        const result = await collection.insertOne({ name, email, password: hashedPassword });
        res.status(200).json({ message: 'Signup successful', data: result });

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
        const token = jwt.sign({ email }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

        res.status(200).json({ message: 'Login successful', token, redirectUrl: '/chatbot' });
      } else {
        res.status(400).json({ message: 'Invalid request type' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error processing request', error });
    } finally {
      await client.close();
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
