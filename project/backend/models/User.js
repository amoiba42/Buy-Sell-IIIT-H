import mongoose from 'mongoose';
import bcrypt from 'bcrypt'; // For hashing passwords

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String,require:true},
  age: { type: Number },
  contactNumber: { type: String},
  itemsInCart: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }],
  sellerReviews:{type:Number,default:5},
}, { timestamps: true });


// In User.js
export default mongoose.model('User', userSchema);
