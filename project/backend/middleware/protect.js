// const jwt = require('jsonwebtoken');
import jwt from 'jsonwebtoken';

const protect = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', ''); // Extract token

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    // Verify the token and extract the user information
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.userId;  // Assuming 'user' is part of the decoded token
    next();  // Proceed to the next middleware or route handler
  } catch (err) {
    return res.status(401).json({ message: "Token is not valid" });
  }
};

export default protect; 