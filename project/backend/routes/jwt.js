import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Signing a token
const signToken = (user) => {
    const payload = { userId: user._id }; // Add necessary data
    const secret = process.env.JWT_SECRET;
    return jwt.sign(payload, secret, { expiresIn: '7d' });
};

// Verifying a token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization; // Extract token from headers
    if (!token) {
        return res.status(401).json({ error: 'Access Denied: No token provided' });
    }

    try {
        const secret = process.env.JWT_SECRET;
        const decoded = jwt.verify(token.split(' ')[1], secret); // Remove "Bearer " prefix
        req.user = decoded; // Attach decoded user info to request
        console.log('Decoded token:', decoded);
        next();
    } catch (error) {
        console.error('Token Verification Failed:', error.message);
        return res.status(403).json({ error: 'Invalid or Expired Token' });
    }
};


const isTokenValid = () => {
    if (typeof window === 'undefined') {
        console.error('localStorage is not available on the server');
        return false;
    }

    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
        const { exp } = jwt.decode(token); // FIX: Use jwt.decode instead of missing function
        if (Date.now() >= exp * 1000) {
            localStorage.removeItem('token'); // Token expired, remove it
            return false;
        }
        return true;
    } catch (err) {
        console.error('Invalid token:', err);
        return false;
    }
};

export { signToken, verifyToken, isTokenValid };
