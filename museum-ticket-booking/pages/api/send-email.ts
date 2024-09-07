import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';
const postmark = require('postmark');

// Create a MongoDB client
const client = new MongoClient(process.env.MONGODB_URI as string);

// Initialize the Postmark client
const postmarkClient = new postmark.ServerClient(process.env.POSTMARK_API_KEY as string);

// Function to send email with PDF attachment
async function sendEmail(to: string) {
  // Define the path to the PDF file (you can adjust the path as needed)
  const pdfPath = path.join(process.cwd(), 'pages', 'confirmation.pdf');

  // Read and encode the PDF as base64
  const pdfData = fs.readFileSync(pdfPath).toString('base64');

  const email = {
    From: process.env.POSTMARK_FROM_EMAIL as string,  // sender address
    To: to,  // recipient's email
    Subject: 'Booking Confirmation',
    TextBody: 'Payment successful! Your booking is confirmed. Thank you for visiting the National Museum of Art.',
    Attachments: [
      {
        Name: 'confirmation.pdf',   // Name of the file in the email
        Content: pdfData,           // Base64 encoded content
        ContentType: 'application/pdf'  // MIME type of the attachment
      }
    ]
  };

  // Send the email using Postmark
  await postmarkClient.sendEmail(email);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      console.log('Connecting to MongoDB...');
      await client.connect();
      const db = client.db('musemate');
      console.log('Fetching latest user...');
      const latestUser = await db.collection('registrations').findOne({}, { sort: { _id: -1 } });
      console.log('Latest user:', latestUser);

      if (latestUser && latestUser.email) {
        console.log('Sending email...');

        await sendEmail(latestUser.email);

        res.status(200).json({ message: 'Email sent successfully with attachment' });
      } else {
        res.status(404).json({ error: 'No user found' });
      }
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    } finally {
      await client.close();
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
