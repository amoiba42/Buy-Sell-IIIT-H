import express from 'express';
import User from '../models/User.js'; // Ensure this path is correct
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import axios from 'axios'; // Missing import
import { signToken, verifyToken } from './jwt.js';

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
        // Verify reCAPTCHA token
        // const isCaptchaValid = await verifyRecaptcha(recaptchaToken);
        // if (!isCaptchaValid) {
        //     return res.status(400).json({ message: 'Invalid reCAPTCHA. Please try again.' });
        // }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt );

        // Create and save the user
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
    console.log('mkc');
    try {
        
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        console.log('mkc1');
        const salt = await bcrypt.genSalt(10);
        let newp = await bcrypt.hash(password, salt);
        // let newp= await bcrypt.hash(password, 10);
        // Check if the password matches
        console.log('p1', password);
        console.log('p9',newp);
        console.log('p2', user.password);
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('p3');
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        console.log('mkc2');

        
        // Verify reCAPTCHA token
        const isCaptchaValid = await verifyRecaptcha(recaptchaToken);
        if (!isCaptchaValid) {
            return res.status(400).json({ message: 'Invalid reCAPTCHA. Please try again.' });
        }
        console.log('mkc3');
        // Generate a JWT token
        const token = signToken(user);
        console.log('my token', token);
        res.status(200).json({ token, message: 'Login successful' });
    } catch (error) {
        console.log('mkc4');
        console.error('Error during login:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
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
