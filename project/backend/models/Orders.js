import mongoose from 'mongoose';
import bcrypt from 'bcrypt'; // For hashing passwords

const orderSchema = new mongoose.Schema({
    transactionId: { type: String, required: true },
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    amount: { type: Number, required: true },
    hashedotp: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Orders', orderSchema);