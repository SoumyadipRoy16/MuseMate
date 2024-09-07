// pages/api/check-payment-status.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default async function checkPaymentStatus(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { paymentId } = req.query;

        // Example logic to fetch payment status
        // You will need to replace this with your actual payment provider or database logic
        const paymentStatus = await fetchPaymentStatusFromProvider(paymentId as string);

        if (paymentStatus.success) {
            res.status(200).json({ successMessage: 'Payment Successful!' });
        } else {
            res.status(200).json({ errorMessage: 'Payment failed. Please try again.' });
        }
    } catch (error) {
        console.error('Error checking payment status:', error);
        res.status(500).json({ error: 'Failed to check payment status' });
    }
}

// Replace this with your actual payment status fetching logic
async function fetchPaymentStatusFromProvider(paymentId: string) {
    // Mock response for illustration purposes
    // You need to replace this with real API call or database query
    return { success: true }; // Or return false if payment failed
}
