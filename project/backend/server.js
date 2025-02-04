import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import User from './models/User.js'; // Ensure this file exists with the User schema
import Item from './models/Item.js'; // Ensure this file exists with the Item schema
import Order from './models/Orders.js'; // Ensure this file exists with the Order schema
import protect from './middleware/protect.js'; // Ensure middleware exists
import authRoutes from './routes/authRoutes.js'; // Ensure this file exists
import { verifyToken } from './routes/jwt.js'; // Use named import
import dotenv from 'dotenv';
import axios from 'axios';
import bodyParser from 'body-parser';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config({ path: './config/.env' });

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

const uri = process.env.MONGO_URI || "mongodb+srv://amoiba42:1nsh%40ll%40h@dass1.emwzl.mongodb.net/?retryWrites=true&w=majority&appName=Dass1";

let chatSessions = {};
const genAI = new GoogleGenerativeAI("AIzaSyBd7K-YUl8WEsjoaDE4xhI-FGBQPvgvwP4");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


const connectTodb = async () => {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB Atlas');
  } catch (err) {
    console.error('Error connecting to MongoDB Atlas:', err);
  }
};

// **Routes**
// Authentication routes
app.use('/api/auth', authRoutes);

// 1. Add a new user
app.post('/api/user', async (req, res) => {
  try {
    const { firstName, lastName, email, password, age, contactNumber } = req.body;
    const newUser = new User({ firstName, lastName, email, password, age, contactNumber });
    const savedUser = await newUser.save();
    res.status(201).json({ message: "User created successfully", user: savedUser });
  } catch (err) {
    res.status(400).json({ error: "Error creating user", details: err.message });
  }
});

// 2. Fetch all users
app.get('/api/user', protect, async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: "Error fetching users", details: err.message });
  }
});

// 3. Fetch a single user by ID
app.get('/api/user/profile', protect, async (req, res) => {
  console.log("got request");
  try {
    console.log(req.user);
    const user = await User.findById(req.user);
        
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    console.log('user', user);
    res.status(200).json(user);  // Return the user data
  } catch (err) {
    res.status(500).json({ error: "Error fetching user", details: err.message });
  }
});


// 4. Update user details
app.put('/api/user/profile', protect, async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.user, req.body, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User updated successfully", user: updatedUser });
  } catch (err) {
    res.status(400).json({ error: "Error updating user", details: err.message });
  }
});

// 5. Delete a user
app.delete('/api/user/profile', protect, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.user);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully", user: deletedUser });
  } catch (err) {
    res.status(500).json({ error: "Error deleting user", details: err.message });
  }
});


//-------------------------------------------------

// 7. Chatbot API
app.post('/api/chat', async (req, res) => {
  const { sessionId, userMessage } = req.body;
  
  if (!sessionId) {
    console.log('Session ID is required');
    return res.status(400).json({ error: "Session ID is required" });
  }

  try {
    // Get previous chat history for the session (if it exists)
    const history = chatSessions[sessionId] || [];

    // Prepare the message payload for the AI model
    // Include the entire history (user and assistant messages) to maintain context
    const messages = [
      ...history,
      { role: 'user', content: userMessage },
    ];

    // Generate a response using the Google Gemini model
    const result = await model.generateContent([messages.map(msg => msg.content).join('\n')]); // Combine all message content for context
    const botMessage = result.response.text();

    // Update the session history with the assistant's response
    chatSessions[sessionId] = [...messages, { role: 'assistant', content: botMessage }];
    
    // Send the generated response back to the client
    res.json({ botMessage });
  } catch (err) {
    console.error('Error generating response:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//-------------------------------------------------

// 8. Add a new item
app.post("/api/items", verifyToken, async (req, res) => {
  try {
    console.log("Received request to add an item");
    console.log("Authenticated user:", req.user);

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: No user found" });
    }
    console.log("req.user",req.user);
    const seller_Id= req.user.userId;
    console.log("seller_Id",seller_Id);
    const newItem = new Item({
      ...req.body,
      sellerId: seller_Id, // Ensure item is linked to the logged-in user
    });

    await newItem.save();

    res.status(201).json(newItem);
  } catch (error) {
    console.error("Error adding item:", error);
    res.status(500).json({ message: "Error adding item", error: error.message });
  }
});


// 9. Fetch all items for a specific user
app.get('/api/items', verifyToken, async (req, res) => {
  try {    
    console.log("Received request for items");
    console.log("Authenticated user:", req.user);
    const user_id=await User.findById(req.user.userId);

    const items = await Item.find({ sellerId: user_id }); // Use authenticated user's ID
    console.log("Fetched items:", items);

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Error fetching items", error: error.stack });
  }
});


// 10. Fetch all items
app.get('/api/all-items', verifyToken, async (req, res) => {
  try {
    console.log("Received request to fetch all items");

    const items = await Item.find(); // Fetch all items
    console.log("Fetched all items:", items);

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Error fetching all items", error: error.stack });
  }
});

// 11. Fetch a single item by ID
// app.get('/api/items/:id',protect, async (req, res) => {
//   try {
//     console.log(`Received request to fetch item with ID: ${req.params.id}`);
//     const item = await Item.findById(req.params.id);
//     if (!item) {
//       return res.status(404).json({ message: 'Item not found' });
//     }
//     res.status(200).json(item);
//   } catch (error) {
//     console.error('Error fetching item:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });
app.get('/api/items/:id', protect, async (req, res) => {
  const { id } = req.params;
  console.log("Received request to fetch item with ID:", id);
  try {
    // Query by itemId (not _id)
    const item = await Item.findOne({ itemId: id });

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    console.error("Error fetching item:", error);
    res.status(500).json({ message: 'Server error' });
  }
});

//-------------------------------------------------

// API endpoint for creating an order
app.post('/api/order',protect, async (req, res) => {
  try {
    const { buyerId, sellerId, amount, hashedotp } = req.body;  // Assuming OTP is passed hashed from frontend
    console.log("Creating order for buyer:", buyerId, "and seller:", sellerId);

    // Check if the buyer is trying to buy their own item
    if (buyerId === sellerId) {
      return res.status(400).json({ error: 'You cannot buy an item listed by you' });
    }

    // Create the new order
    const newOrder = new Order({
      buyerId: buyerId,
      sellerId: sellerId,
      amount: amount,
      hashedotp: hashedotp, // Store the hashed OTP sent from frontend
    });

    const savedOrder = await newOrder.save();
    
    // Respond with success and the order details
    res.status(201).json({ message: 'Order created successfully', order: savedOrder });
    
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ error: 'Error creating order', details: err.message });
  }
});


app.get("/api/orders/",protect, async (req, res) => {
  console.log("Inside orders API");

  try {
    // const { userId } = req.params;
    const userId = req.user;
    console.log("User ID:", userId);

    // Fetch orders where the given userId matches sellerId
    const orders = await Order.find({ sellerId: req.user });

    if (orders.length === 0) {
      return res.status(404).json({ message: "No orders found for this seller." });
    }

    console.log("Orders fetched successfully");
    res.status(200).json(orders);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ error: "Failed to retrieve orders" });
  }
});

app.put('/api/orders/:id/close', async (req, res) => {
  try {
    const { otp } = req.body;
    const orderId = req.params.id;

    // Verify OTP and perform any necessary checks
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).send('Order not found');

    // Proceed to close the order
    order.closed = true;
    await order.save();

    res.status(200).json(order);
  } catch (error) {
    res.status(500).send('Server error');
  }
});


app.get("/api/orders/completed", protect, async (req, res) => {
  try {
    const completedOrders = await Order.find({ sellerId: req.user, closed: true });
    res.status(200).json(completedOrders);
  } catch (err) {
    console.error("Error fetching completed orders:", err);
    res.status(500).json({ error: "Failed to retrieve orders" });
  }
});

app.get("/api/orders/purchased", protect, async (req, res) => {
  try {
    const purchasedItems = await Item.find({ buyerId: req.user, isDeliverable: false });
    res.status(200).json(purchasedItems);
  } catch (err) {
    console.error("Error fetching purchased items:", err);
    res.status(500).json({ error: "Failed to retrieve items" });
  }
});



// Add item to user's cart
// app.post('/api/user/cart', async (req, res) => {
//   try {
//     console.log('Received request to add item to cart');
//     const { itemId, userId } = req.body;  // Fix destructuring
//     console.log('User ID:', userId);
//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }
//     console.log('fu', itemId);
//     if (!Array.isArray(user.itemsInCart)) {
//       user.itemsInCart = [];  // Initialize it as an empty array if undefined
//     }
//     if (user.itemsInCart.includes(itemId)) {
//       return res.status(400).json({ error: 'Item already in cart' });
//     }

//     user.itemsInCart.push(itemId);
//     await user.save();
//     res.status(200).json({ message: 'Item added to cart', user });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Failed to add item to cart' });
//   }
// });
// const mongoose = require('mongoose');

app.post('/api/user/cart', async (req, res) => {
  try {
    console.log('Received request to add item to cart');
    const { itemId, userId } = req.body;
    console.log('User ID:', userId);

    // Validate itemId as a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ error: 'Invalid itemId format' });
    }

    // Convert itemId to ObjectId using new mongoose.Types.ObjectId
    const itemObjectId = new mongoose.Types.ObjectId(itemId);

    // Fetch the user by their userId
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('Item ID:', itemObjectId);

    // Ensure itemsInCart is an array
    if (!Array.isArray(user.itemsInCart)) {
      user.itemsInCart = [];  // Initialize as an empty array if undefined
    }

    // Check if the item is already in the cart
    if (user.itemsInCart.some(item => item.toString() === itemObjectId.toString())) {
      return res.status(400).json({ error: 'Item already in cart' });
    }

    // Add the item (as ObjectId) to the cart
    user.itemsInCart.push(itemObjectId);

    // Save the updated user
    await user.save();

    res.status(200).json({ message: 'Item added to cart', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});


// Remove item from user's cart
app.delete('/api/user/cart/:itemId', async (req, res) => {
  try {
    console.log('Received request to remove item from cart');
    const { userId } = req.body;  // Extract userId from the request body
    const { itemId } = req.params;  // Extract itemId from URL parameters

    console.log('User ID:', userId, 'Item ID:', itemId);

    // Validate itemId as a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ error: 'Invalid itemId format' });
    }

    // Convert itemId to ObjectId
    const itemObjectId = new mongoose.Types.ObjectId(itemId);

    // Fetch the user by their userId
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find the index of the item in the cart (compare as ObjectId)
    const itemIndex = user.itemsInCart.findIndex(item => item.toString() === itemObjectId.toString());

    if (itemIndex === -1) {
      return res.status(400).json({ error: 'Item not in cart' });
    }

    // Remove the item from the cart
    user.itemsInCart.splice(itemIndex, 1);
    await user.save();

    res.status(200).json({ message: 'Item removed from cart', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
});

// app.delete('/api/user/cart/:itemId', async (req, res) => {
//   try {
//     console.log('Received request to remove item from cart');
//     const { userId } = req.body;  // Extract userId from the request body
//     const { itemId } = req.params;  // Extract itemId from URL parameters

//     console.log('User ID:', userId, 'Item ID:', itemId);

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }
//     const itemIndex = user.itemsInCart.indexOf(itemId);
//     if (itemIndex === -1) {
//       return res.status(400).json({ error: 'Item not in cart' });
//     }
//     user.itemsInCart.splice(itemIndex, 1);
//     await user.save();

//     res.status(200).json({ message: 'Item removed from cart', user });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Failed to remove item from cart' });
//   }
// });



// Fetch everything from user's cart
// Get user's cart items
app.get('/api/user/cart/:userId', async (req, res) => {
  console.log('inside api');
  try {
    console.log('inside api');
    const { userId }=req.params;
    console.log('User ID:', userId);

    const user = await User.findById(userId).populate('itemsInCart');
    // const user = await User.findById(userId).populate('itemsInCart');
    console.log('bs');
    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve cart items' });
  }
});


app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  await connectTodb();
  console.log('Server is ready, database connected.');
});


export default connectTodb; 