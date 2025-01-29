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
  quantity: { type: Number, default: 1 },
}, { timestamps: true });

itemSchema.pre('save', function (next) {
  if (!this.itemId) {
    this.itemId = 'ITEM-' + new Date().getTime(); 
  }
  next();
});

// const Item = mongoose.model('Item', itemSchema);

export default mongoose.model('Item', itemSchema);
