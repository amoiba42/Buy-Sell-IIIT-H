import mongoose from 'mongoose';
const { Schema } = mongoose;

const itemSchema = new mongoose.Schema({
  itemId: { 
    type: String, 
    unique: true, 
    required: true, 
    default: () => 'ITEM-' + new Date().getTime() 
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  condition: { type: String, required: true },
  category: { type: String, required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' ,default: null},
  isDeliverable: { type: Boolean, default: true},
}, { timestamps: true });

itemSchema.pre('save', function (next) {
  if (!this.itemId) {
    this.itemId = 'ITEM-' + new Date().getTime(); 
  }
  next();
});

export default mongoose.model('Item', itemSchema);
