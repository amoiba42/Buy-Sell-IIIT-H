import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import bcrypt from 'bcryptjs';

const MyCart = () => {
  const [cartItems, setCartItems] = useState([]); // Initialize as an empty array
  const [error, setError] = useState(null);
  const [otpMessage, setOtpMessage] = useState('');
  const token = localStorage.getItem('token');

  const fetchUserFromToken = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data; // Returns user object
    } catch (error) {
      console.error("Error fetching user from token:", error);
      return null; // Handle authentication failure
    }
  };

  useEffect(() => {
    const fetchCartItems = async () => {
      const user = await fetchUserFromToken();  // Assuming this function returns the user object with _id
      if (user) {
        try {
          console.log("Fetching cart items from frontend..");

          // Pass the userId as part of the URL and include the token in headers
          const response = await axios.get(`http://localhost:5001/api/user/cart/${user._id}`, {
            headers: {
              Authorization: `Bearer ${token}`,  // Add token to Authorization header
            },
          });

          if (response.status === 200) {
            setCartItems(response.data.itemsInCart || []);  // Default to empty array if itemsInCart is undefined
          } else {
            setError('Failed to fetch cart items.');
          }
        } catch (err) {
          console.error("Error fetching cart items:", err);
          setError('Failed to fetch cart items.');
        }
      } else {
        setError('Failed to fetch user data.');
      }
    };

    fetchCartItems();
  }, [token]);

  const generateOtp = () => {
    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
    return otp.toString();
  };

  const hashOtp = async (otp) => {
    const hashedOtp = await bcrypt.hash(otp, 10);  // Hash OTP with bcrypt
    return hashedOtp;
  };

  const placeOrder = async (item) => {
    try {
      const otp = generateOtp(); // Generate OTP
      const hashedOtp = await hashOtp(otp); // Hash OTP for security

      // Get user data from the token
      const userResponse = await axios.get('http://localhost:5001/api/user/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const user = userResponse.data._id;  // Corrected user data retrieval
      
      // Prepare order data
      const orderData = {
        buyerId: user,
        sellerId: item.sellerId,
        amount: item.price,
        hashedotp: hashedOtp,  // Send hashed OTP to backend
      };

      // Call API to create an order
      const response = await axios.post('http://localhost:5001/api/order', orderData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Check if the response is successful
      if (response.status === 201) {
        setOtpMessage(`Your One-Time Password (OTP) for this order is: ${otp}. Please inform the seller about this OTP.`);
        alert('Order placed successfully. Check your OTP.');
      }
    } catch (error) {
      console.error("Error placing order:", error);
      setError('Failed to place order.');
    }
  };

  return (
    <div>
      <h1>My Cart</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {cartItems.length === 0 && <p>Your cart is empty.</p>}
      
      {cartItems.map((item) => (
        <div key={item.itemId} className="cart-item">
          <h2>{item.name}</h2>
          <img src={item.image} alt={item.name} className="item-image" />
          <p>Price: ₹{item.price}</p>
          <p>Condition: {item.condition}</p>
          <p>Category: {item.category}</p>

          <button onClick={() => placeOrder(item)} className="place-order-btn">
            Place Order
          </button>
        </div>
      ))}

      {otpMessage && <p className="otp-message">{otpMessage}</p>}
    </div>
  );
};

export default MyCart;
