import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import User from './models/User.js'; 
import Item from './models/Item.js'; 
import Order from './models/Orders.js'; 
import protect from './middleware/protect.js'; 
import authRoutes from './routes/authRoutes.js';
import { verifyToken } from './routes/jwt.js'; 
import dotenv from 'dotenv';
import axios from 'axios';
import bodyParser from 'body-parser';
import { GoogleGenerativeAI } from '@google/generative-ai';
import bcrypt from "bcryptjs";
import xml2js from 'xml2js';


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


//---------------(***USER---APIS***)----------------------------------
app.get("/cas/callback", async (req, res) => {
  console.log("CAS Callback in app");
  const { ticket } = req.query;
  const service = "http://localhost:5001/auth/cas/callback";
  console.log(ticket);
  if (!ticket) {
    console.error("Missing CAS ticket");
    return res.status(400).json({ message: "Missing CAS ticket" });
  }

  try {
    // Verify the CAS ticket
    const casResponse = await axios.get(
      `https://login.iiit.ac.in/cas/serviceValidate?ticket=${ticket}&service=${service}`
    );
    console.log(casResponse.data);

    xml2js.parseString(casResponse.data, async (err, result) => {
      if (err) {
        console.error("XML Parsing Error:", err);
        return res.status(500).json({ message: "Error parsing CAS response" });
      }

      const success = result["cas:serviceResponse"]["cas:authenticationSuccess"];
      if (!success) {
        console.error("CAS authentication failed");
        return res.status(401).json({ message: "CAS authentication failed" });
      }

      const email = success[0]["cas:user"][0];
      const casAttributes = success[0]["cas:attributes"] || {};
      const firstName = casAttributes["cas:FirstName"]?.[0] || "Unknown";
      const lastName = casAttributes["cas:LastName"]?.[0] || "Unknown";

      // Random values for required fields
      const randomAge = Math.floor(Math.random() * (60 - 18 + 1)) + 18;
      const randomContactNumber = `+91${Math.floor(Math.random() * 1000000000) + 9000000000}`;

      // Check if user exists or create new one
      let user = await User.findOne({ email });
      if (!user) {
        const hashedPassword = await bcrypt.hash("cas-authenticated", 10);
        const newUser = new User({
          email,
          firstName,
          lastName,
          age: randomAge,
          contactNumber: randomContactNumber,
          password: hashedPassword,
          cart: [],
          sellerReviews: [],
        });

        try {
          user = await newUser.save();
        } catch (err) {
          console.error("Error creating CAS user:", err);
          return res.status(500).json({ message: "Error creating CAS user" });
        }
      }

      // Generate JWT token
      const token = signToken(user);
      
      // Redirect with token
      res.redirect(`http://localhost:3000/cas-auth?token=${token}`);
    });
  } catch (error) {
      console.log('error', error.stack);
    console.error("CAS Login Error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
});

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


//---------------(***CHATBOT---APIS***)----------------------------------



// 7. Chatbot API
app.post('/api/chat', async (req, res) => {
  const { sessionId, userMessage } = req.body;
  
  if (!sessionId) {
    console.log('Session ID is required');
    return res.status(400).json({ error: "Session ID is required" });
  }

  try {
    const history = chatSessions[sessionId] || [];

    const messages = [
      ...history,
      { role: 'user', content: userMessage },
    ];

    const result = await model.generateContent([messages.map(msg => msg.content).join('\n')]); // Combine all message content for context
    const botMessage = result.response.text();
    chatSessions[sessionId] = [...messages, { role: 'assistant', content: botMessage }];
    
    res.json({ botMessage });
  } catch (err) {
    console.error('Error generating response:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//---------------(***ITEM---APIS***)----------------------------------



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
      sellerId: seller_Id, 
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

    const items = await Item.find({ sellerId: user_id });
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
    
    
    const items = await Item.find()
      .populate('sellerId', 'firstName lastName')
      .lean()  
      .catch(err => {
        console.error("Database query error:", err);
        throw err;
      });

    if (!items) {
      throw new Error("No items returned from database");
    }

    console.log("Successfully fetched items count:", items.length);
    
    res.json(items);

  } catch (error) {
    console.error("Detailed error in /api/all-items:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    res.status(500).json({ 
      message: "Error fetching items",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// 11. Fetch a single item by ID
app.get('/api/items/:id', protect, async (req, res) => {
  const { id } = req.params;
  console.log("Received request to fetch item with ID:", id);
  try {
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

//---------------(***ORDER---APIS***)----------------------------------



// 12. API endpoint for creating an order
app.post('/api/order',protect, async (req, res) => {
  try {
    const { buyerId, sellerId, amount,nameofitem, hashedotp } = req.body;  
    console.log("Creating order for buyer:", buyerId, "and seller:", sellerId);
    console.log("buyerid",buyerId);
    console.log("sellerid",sellerId._id);
    if (buyerId === sellerId._id) {
      return res.status(400).json({ error: 'You cannot buy an item listed by you' });
    }

    const newOrder = new Order({
      buyerId: buyerId,
      sellerId: sellerId,
      amount: amount,
      nameofitem: nameofitem,
      hashedotp: hashedotp, 
    });

    const savedOrder = await newOrder.save();
    
    console.log("order details",savedOrder);
    res.status(201).json({ message: 'Order created successfully', order: savedOrder });
    
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ error: 'Error creating order', details: err.message });
  }
});

// 13. Fetch all orders corresponding to a user
app.get("/api/orders", protect, async (req, res) => {
  try {
    const userId = req.user; 
    const { buyerId, sellerId, closed } = req.query;

    let query = {}; 

    if (buyerId) {
      query.buyerId = buyerId;
    }

    if (sellerId) {
      query.sellerId = sellerId;
    }

    if (closed !== undefined) {
      query.closed = closed === 'true'; // 'true' will be converted to boolean true
    }
    else {
      query.closed = false; // If closed is not provided, assume false for pending orders
    }

    // If no buyerId or sellerId is provided, the query defaults to fetching orders based on the logged-in user
    if (!buyerId && !sellerId) {
      query.$or = [{ buyerId: userId }, { sellerId: userId }];
    }

    const orders = await Order.find(query)
      .populate('sellerId', 'firstName lastName')
      .populate('buyerId', 'firstName lastName');

    if (orders.length === 0) {
      return res.status(404).json({ message: "No orders found." });
    }

    console.log("Orders fetched successfully");
    res.status(200).json(orders);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ error: "Failed to retrieve orders" });
  }
});

// 14. Close an order
app.put('/api/orders/:id/close',protect, async (req, res) => {
  try {
    const { otp } = req.body; 
    const orderId = req.params.id;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).send('Order not found');

    const isOtpValid = await bcrypt.compare(otp, order.hashedotp); 
    if (!isOtpValid) {
      return res.status(400).json({ message: 'Incorrect OTP' }); 
    }
    console.log('OTP verified successfully');
    order.closed = true;
    await order.save();

    res.status(200).json(order); 
  } catch (error) {
    console.error('Error closing order:', error);
    res.status(500).send('Server error');
  }
});

// 15. Update OTP for an order
app.put("/api/order/:orderId",protect, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { hashedotp } = req.body;

    console.log("Updating OTP for Order ID:", orderId);

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { hashedotp },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found." });
    }

    res.status(200).json({ message: "OTP updated successfully." });
  } catch (error) {
    console.error("Error updating OTP:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});


// 16. Fetch all completed orders
app.get("/api/orders/completed", protect, async (req, res) => {
  try {
    const completedOrders = await Order.find({ sellerId: req.user, closed: true }).populate('buyerId', 'firstName lastName').lean();
    res.status(200).json(completedOrders);
  } catch (err) {
    console.error("Error fetching completed orders:", err);
    res.status(500).json({ error: "Failed to retrieve orders" });
  }
});

// 17. Fetch all pending orders
app.get("/api/orders/purchased", protect, async (req, res) => {
  try {
    const purchasedItems = await Item.find({ buyerId: req.user, isDeliverable: false }).populate('sellerId', 'firstName lastName').lean();
    res.status(200).json(purchasedItems);
  } catch (err) {
    console.error("Error fetching purchased items:", err);
    res.status(500).json({ error: "Failed to retrieve items" });
  }
});

//---------------(***CART---APIS***)----------------------------------




// 18. Add item to cart
app.post('/api/user/cart',protect, async (req, res) => {
  try {
    console.log('Received request to add item to cart');
    const { itemId, userId } = req.body;
    console.log('User ID abc:', userId);
    console.log('itemId abc:', itemId);

    // Validate itemId as a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ error: 'Invalid itemId format' });
    }
    console.log('okay');
    const itemObjectId = new mongoose.Types.ObjectId(itemId);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (!Array.isArray(user.itemsInCart)) {
      user.itemsInCart = [];  // Initialize as an empty array if undefined
    }

    // Check if the item is already in the cart
    if (user.itemsInCart.some(item => item.toString() === itemObjectId.toString())) {
      return res.status(400).json({ error: 'Item already in cart' });
    }

    // Add the item (as ObjectId) to the cart
    user.itemsInCart.push(itemObjectId);
    console.log('Item added to cart');

    await user.save();
    console.log('User saved');
    res.status(200).json({ message: 'Item added to cart', user });
  } catch (err) {
    console.log('Error adding item to cart:', err);
    console.error(err);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});


// 19. Remove item from user's cart
app.delete('/api/user/cart/:itemId',protect, async (req, res) => {
  try {
    console.log('Received request to remove item from cart');
    const { userId } = req.body; 
    const { itemId } = req.params;  

    console.log('User ID:', userId, 'Item ID:', itemId);

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ error: 'Invalid itemId format' });
    }

    const itemObjectId = new mongoose.Types.ObjectId(itemId);
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const itemIndex = user.itemsInCart.findIndex(item => item.toString() === itemObjectId.toString());

    if (itemIndex === -1) {
      return res.status(400).json({ error: 'Item not in cart' });
    }

    user.itemsInCart.splice(itemIndex, 1);
    await user.save();

    res.status(200).json({ message: 'Item removed from cart', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
});


// 20. Fetch everything from user's cart
app.get('/api/user/cart/:userId', protect,async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('User ID:', userId);

    const user = await User.findById(userId)
      .populate({
        path: 'itemsInCart', 
        populate: {
          path: 'sellerId', 
          select: 'firstName lastName'
        }
      });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const deliverableItems = user.itemsInCart.filter(item => item.isDeliverable !== false);
    user.itemsInCart = deliverableItems;

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