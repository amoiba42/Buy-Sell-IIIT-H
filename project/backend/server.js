import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import User from './models/User.js'; // Ensure this file exists with the User schema
import Item from './models/Item.js'; // Ensure this file exists with the Item schema
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

// 8. Add a new item
app.post("/api/items", verifyToken, async (req, res) => {
  try {
    const newItem = new Item({
      ...req.body,
      sellerId: req.user.id, // Ensure only the logged-in user is attached
    });

    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ message: "Error adding item", error });
  }
});

// Fetch all items for a specific user
app.get('/api/items', async (req, res) => {
  try {
    const { sellerId } = req.query;
    const items = await Item.find({ sellerId });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Error fetching items", error });
  }
});


app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  await connectTodb();
  console.log('Server is ready, database connected.');
});


export default connectTodb; 