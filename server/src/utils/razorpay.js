import Razorpay from 'razorpay';
import { ApiError } from './ApiError.js';

export const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error("Razorpay Key ID or Key Secret not configured. Payment processing will fail.");
}