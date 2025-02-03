import mongoose from 'mongoose';
import bcrypt from 'bcrypt'; // For hashing passwords
import crypto from 'crypto'; // To generate unique transaction IDs

// Function to generate a unique transaction ID
// const generateTransactionId = () => {
//   const timestamp = Date.now().toString(36);  // Convert timestamp to base-36 string (shorter)
//   const randomBytes = crypto.randomBytes(8).toString('hex');  // Generate 16 characters of random hex
//   return `${timestamp}-${randomBytes}`;
// };

const orderSchema = new mongoose.Schema({
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    amount: { type: Number, required: true },
    hashedotp: { type: String, required: true },
    // transactionId: { type: String, required: true },
}, { timestamps: true });

// Pre-save middleware to generate transactionId before saving
// orderSchema.pre('save', function (next) {
//   if (this.isNew) {  // Only generate a transactionId for new orders
//     this.transactionId = generateTransactionId();
//   }
//   next();
// });

export default mongoose.model('Order', orderSchema);
