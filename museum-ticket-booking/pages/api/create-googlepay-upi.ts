import { NextApiRequest, NextApiResponse } from 'next';
import QRCode from 'qrcode';

// Define a type for the payment object
type Payment = {
    status: 'pending' | 'completed';
    amount: number;
};

// Create the payments object with a proper type
const payments: Record<string, Payment> = {};

export default async function createGooglePayUPI(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { total, language } = req.body;

        if (!total || !language) {
            return res.status(400).json({ error: 'Missing required fields: total or language' });
        }

        const upiID = "parthibmudi9534@okicici"; // Your UPI ID
        const name = "Parthib Mudi";
        const paymentId = `${Date.now()}-${Math.floor(Math.random() * 10000)}`; // Generate a unique payment ID

        const upiString = `upi://pay?pa=${upiID}&pn=${name}&am=${total}&cu=INR&tn=Payment for Museum Tickets&tr=${paymentId}`;

        // Generate QR code
        const qrImage = await QRCode.toDataURL(upiString);

        // Store the payment ID and status
        payments[paymentId] = { status: 'pending', amount: total };

        res.status(200).json({
            upiQRString: upiString,
            qrImage,  // Send the QR code image
            paymentId,  // Send the payment ID to the frontend
        });

        // Simulate checking for payment status (In real-world, use webhooks or polling)
        setTimeout(() => {
            // Simulate payment completion
            payments[paymentId].status = 'completed';
            console.log(`Payment with ID ${paymentId} completed.`);
        }, 10000); // Mock payment completion after 10 seconds

    } catch (error) {
        console.error('Error creating UPI QR Code:', error);
        res.status(500).json({ error: 'Failed to create UPI QR Code' });
    }
}

// Another API endpoint to check payment status
export async function checkPaymentStatus(req: NextApiRequest, res: NextApiResponse) {
    const { paymentId, language } = req.query;

    if (!paymentId) {
        return res.status(400).json({ error: 'Missing payment ID' });
    }

    const payment = payments[paymentId as string];

    if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
    }

    if (payment.status === 'completed') {
        res.status(200).json({
            successMessage: language === 'Bengali'
                ? "পেমেন্ট সফল হয়েছে! আপনার কেনার জন্য ধন্যবাদ।"
                : language === 'Hindi'
                ? "भुगतान सफल हुआ! आपकी खरीदारी के लिए धन्यवाद।"
                : "Payment Successful! Thank you for your purchase.",
        });
    } else {
        res.status(200).json({ status: 'pending' });
    }
}
