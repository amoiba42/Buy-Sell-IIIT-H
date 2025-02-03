import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import './ItemPage.css';

const ItemPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [isInCart, setIsInCart] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [otpMessage, setOtpMessage] = useState('');
  const token = localStorage.getItem('token');

  const fetchUserFromToken = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('http://localhost:5001/api/user/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;  // This should return the user object
    } catch (error) {
      console.error("Error fetching user from token:", error);
      return null;  // Handle any errors in fetching user details
    }
  };
  

  useEffect(() => {
    console.log('inside page');
    console.log("Item ID:", id);  // Ensure the ID is correct
    const fetchItem = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/items/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        // Assuming `isDeliverable` is a field in the response
        const updatedItem = { 
          ...response.data, 
          available: response.data.isDeliverable ? "Yes" : "No"  // Set availability based on isDeliverable
        };
        
        setItem(updatedItem);
      } catch (err) {
        console.error("Error fetching item:", err);
        setError(err.response?.data?.message || "Failed to load item");
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);  // Dependency on `id`

  const toggleCartStatus = async () => {
    if (!item) return;
  
    // Fetch the user from token
    const user = await fetchUserFromToken();
    console.log('User in itempage is:', user); 
  
    // Check if the user is the seller of the item
    if (user && user._id === item.sellerId) {
      alert('You cannot buy an item listed by you.');
      return;
    }
  
    if (item.available === "No") {
      alert('Item is not available for purchase');
      return;
    }
  
    // Proceed with adding the item to the cart and creating the order
    try {
      const otp = generateOtp(); // Generate OTP
      const hashedOtp = await hashOtp(otp); // Hash OTP for security
  
      // Create order data
      const orderData = {
        buyerId: user._id,
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
        setIsInCart(true);
        setOtpMessage(`Your One-Time Password (OTP) for this order is: ${otp}. Please inform the seller about this OTP.`);
        alert('Order placed successfully. Check your OTP.');
      }
  
    } catch (error) {
      console.error("Error placing order:", error);
      setError('Failed to place order.');
    }
  };

  const hashOtp = async (otp) => {
    const hashedOtp = await bcrypt.hash(otp, 10);  // Hash OTP with bcrypt
    return hashedOtp;
  };

  const generateOtp = () => {
    // OTP generation logic
    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
    return otp.toString();
  };

  if (loading) return <p>Loading item details...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!item) return <p>Item not found.</p>;

  return (
    <div className="item-detail-card">
      <button onClick={() => navigate(-1)} className="go-back-btn">
        Go Back
      </button>
      <div className="item-detail-content">
        <h1>{item.name}</h1>
        <img src={item.image} alt={item.name} className="item-image" />
        <p className="item-description">{item.description}</p>
        <p>Price: ₹{item.price}</p>
        <p>Condition: {item.condition}</p>
        <p>Category: {item.category}</p>
        <p>Available: {item.available}</p>
        
        <button onClick={toggleCartStatus} className="cart-btn">
          {isInCart ? "Remove from Cart" : "Add to Cart"}
        </button>
        
        {otpMessage && <p className="otp-message">{otpMessage}</p>}
      </div>
    </div>
  );
};

export default ItemPage;
