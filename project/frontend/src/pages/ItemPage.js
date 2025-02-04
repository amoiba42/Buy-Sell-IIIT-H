import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/ItemPage.css';

const ItemPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [isInCart, setIsInCart] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const token = localStorage.getItem('token');

  // Fetch user info from token
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

  // Fetch item details
  useEffect(() => {
    console.log("Fetching item details...");
    const fetchItem = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/items/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const updatedItem = { 
          ...response.data, 
          // available: response.data.isDeliverable ? "Yes" : "No",
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
  }, [id]);

  // Check if the item is already in the cart
  useEffect(() => {
    const checkCartStatus = async () => {
      if (!token || !item) return;

      try {
        const user = await fetchUserFromToken();
        if (!user) return;

        const response = await axios.get(`http://localhost:5001/api/user/cart/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const cartItems = response.data.cart || [];
        setIsInCart(cartItems.some(cartItem => cartItem.itemId === item._id));
      } catch (err) {
        console.error("Error checking cart status:", err);
      }
    };

    checkCartStatus();
  }, [item]);

  // Handle Add to Cart
  const toggleCartStatus = async () => {
    if (!item) return;
  
    const user = await fetchUserFromToken();
    if (!user) {
      alert("Please log in to add items to your cart.");
      navigate('/login');
      return;
    }
  
    if (user.id === item.sellerId) {
      alert("You cannot buy an item listed by you.");
      return;
    }
  
    if (item.available === "No") {
      alert("Item is not available for purchase.");
      return;
    }
  
    try {
      const response = await axios.post(
        'http://localhost:5001/api/user/cart',
        { itemId: item._id, userId: user._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      setSuccessMessage("Item added to cart successfully!");
      setIsInCart(true);
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.error === "Item already in cart") {
        alert("Item is already in your cart.");
        setIsInCart(true);
      } else {
        console.error("Error updating cart:", err);
        setError("Failed to update cart.");
      }
    }
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
          {isInCart ? "Added to Cart" : "Add to Cart"}
        </button>

        {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
      </div>
    </div>
  );
};

export default ItemPage;
