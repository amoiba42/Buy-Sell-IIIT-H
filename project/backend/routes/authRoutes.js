import express from 'express';
import User from '../models/User.js'; // Ensure this path is correct
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import axios from 'axios'; // Missing import
import { signToken, verifyToken } from './jwt.js';
import xml2js from 'xml2js';
const router = express.Router();
const SECRET = process.env.JWT_SECRET || 'defaultSecret';
const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY || 'your-recaptcha-secret-key';



// Register route
router.post('/register', async (req, res) => {
    const { firstName, lastName, email, password, age, contactNumber} = req.body;

    try { 
        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt );

        const user = new User({ firstName, lastName, email, password: hashedPassword, age, contactNumber });
        await user.save();
        
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error during registration:', error.message);
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { email, password, recaptchaToken } = req.body;
    try {
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Check if the password matches
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        
        // Verify reCAPTCHA token
        const isCaptchaValid = await verifyRecaptcha(recaptchaToken);
        if (!isCaptchaValid) {
            return res.status(400).json({ message: 'Invalid reCAPTCHA. Please try again.' });
        }
        // Generate a JWT token
        const token = signToken(user);
        console.log('my token', token);
        res.status(200).json({ token, message: 'Login successful' });
    } catch (error) {
        console.error('Error during login:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


router.get("/cas/callback", async (req, res) => {
    console.log("CAS Callback");
    const { ticket } = req.query;
    const service = "http://localhost:5001/api/auth/cas/callback";
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
        const randomContactNumber = `${Math.floor(Math.random() * 1000000000) + 9000000000}`;
  
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

// Function to verify reCAPTCHA token
const verifyRecaptcha = async (recaptchaToken) => {
    try {
        const response = await axios.post(`https://www.google.com/recaptcha/api/siteverify`, null, {
            params: {
                secret: RECAPTCHA_SECRET_KEY,
                response: recaptchaToken,
            },
        });
        return response.data.success;
    } catch (error) {
        console.error('reCAPTCHA verification error:', error.message);
        return false;
    }
};

// Protected route (example)
router.get('/protect', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        navigate('/login');
        return res.status(401).json({ message: 'Access denied' });
    }

    try {
        const decoded = verifyToken(token);
        res.json({ message: 'Access granted', data: decoded });
    } catch (err) {
        console.error('Invalid token:', err.message);
        res.status(401).json({ message: 'Invalid token' });
    }
});


export default router;
