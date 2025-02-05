import React, { useState, useEffect } from "react";
import axios from "axios";
import bcrypt from "bcryptjs";

const MyCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [error, setError] = useState(null);
  const [otpMessages, setOtpMessages] = useState([]);
  const [orderedItems, setOrderedItems] = useState({}); // Track placed orders
  const token = localStorage.getItem("token");

  const fetchUserFromToken = async () => {
    try {
      const response = await axios.get("http://localhost:5001/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchCartItems = async () => {
      const user = await fetchUserFromToken();
      if (user) {
        try {
          const response = await axios.get(`http://localhost:5001/api/user/cart/${user._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.status === 200) {
            setCartItems(response.data.itemsInCart || []);
          } else {
            setError("Failed to fetch cart items.");
          }
        } catch (err) {
          console.error("Error fetching cart items:", err);
          setError("Failed to fetch cart items.");
        }
      } else {
        setError("Failed to fetch user data.");
      }
    };

    fetchCartItems();
  }, [token]);

  const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

  const hashOtp = async (otp) => {
    return await bcrypt.hash(otp, 10);
  };

  const removeItem = async (itemId) => {
    try {
      const user = await fetchUserFromToken();
      if (!user) {
        setError("Failed to fetch user data.");
        return;
      }

      const response = await axios.delete(`http://localhost:5001/api/user/cart/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { userId: user._id },
      });

      if (response.status === 200) {
        setCartItems((prev) => prev.filter((item) => item._id !== itemId));
        alert("Item removed from cart successfully.");
      } else {
        setError("Failed to remove item from cart.");
      }
    } catch (error) {
      console.error("Error removing item from cart:", error);
      setError("Failed to remove item from cart.");
    }
  };

  const placeOrder = async (item) => {
    try {
      const otp = generateOtp();
      const hashedOtp = await hashOtp(otp);
  
      const userResponse = await axios.get("http://localhost:5001/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const user = userResponse.data._id;
      const username = userResponse.data.firstName;
  
      const orderData = {
        buyerId: user,
        sellerId: item.sellerId,
        nameofitem: item.name,
        amount: item.price,
        hashedotp: hashedOtp,
      };
  
      const response = await axios.post("http://localhost:5001/api/order", orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (response.status === 201) {
        const { _id } = response.data.order; 
        setOtpMessages((prev) => [
          ...prev,
          `Your OTP for ${item.name} is: ${otp}. Please inform the seller.`,
        ]);
  
        setOrderedItems((prev) => ({
          ...prev,
          [item._id]: { ordered: true, orderId: _id, otp: otp }, 
        }));
  
        alert(`Order placed successfully for ${item.name}! Your OTP: ${otp}`);
        
        await removeItem(item._id);
      }
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.error === 'You cannot buy an item listed by you') {
        alert("You cannot buy an item listed by you");
        await removeItem(item._id);
      } 
      else {
      console.error("Error placing order:", error);
      setError("Failed to place order.");
      }
    }
  };
    
  const regenerateOtp = async (item) => {
    try {
      const newOtp = generateOtp();
      const hashedOtp = await hashOtp(newOtp);
  
      const orderId = orderedItems[item._id]?.orderId;
  
      if (!orderId) {
        console.error("Error: Order ID not found for item", item._id);
        setError("Order ID missing. Please try again.");
        return;
      }
  
      await axios.put(
        `http://localhost:5001/api/order/${orderId}`, 
        { hashedotp: hashedOtp },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      setOrderedItems((prev) => ({
        ...prev,
        [item._id]: { ordered: true, orderId: orderId, otp: newOtp },
      }));
  
      alert(`New OTP for ${item.name} is: ${newOtp}. Please inform the seller.`);
    } catch (error) {
      console.error("Error regenerating OTP:", error);
      setError("Failed to regenerate OTP.");
    }
  };
  

  const checkoutCart = async () => {
    for (const item of cartItems) {
      await placeOrder(item);
    }
    setCartItems([]);
  };

  const totalAmount = cartItems.reduce((acc, item) => acc + item.price, 0);

  return (
    <div style={{ padding: "200px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>My Cart</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {cartItems.length === 0 ? <p>Your cart is empty.</p> : null}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "20px",
          justifyItems: "center",
          marginTop: "20px",
        }}
      >
        {cartItems.map((item) => (
          <div key={item._id} style={{ border: "1px solid #ccc", padding: "10px", borderRadius: "10px", boxShadow: "2px 2px 10px rgba(0,0,0,0.1)", width: "100%", maxWidth: "300px", textAlign: "center" }}>
            <h3>{item.name}</h3>
            {/* <img src={item.image} alt={item.name} style={{ width: "100%", height: "150px", objectFit: "cover", borderRadius: "5px" }} /> */}
            <p>Price: ₹{item.price}</p>
            <p>Condition: {item.condition}</p>
            <p>Category: {item.category}</p>
            <p>Seller: {item.sellerId ? `${item.sellerId.firstName} ${item.sellerId.lastName}` : "Unknown"}</p>

            {orderedItems[item._id]?.ordered ? (
              <>
                <p style={{ color: "green" }}>Order Placed! OTP: {orderedItems[item._id]?.otp}</p>
                <button
                  onClick={() => regenerateOtp(item)}
                  style={{
                    marginTop: "10px",
                    padding: "8px",
                    backgroundColor: "#f0ad4e",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Regenerate OTP
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => placeOrder(item)}
                  style={{
                    marginTop: "10px",
                    padding: "8px",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    marginRight: "5px",
                  }}
                >
                  Place Order
                </button>

                <button
                  onClick={() => removeItem(item._id)}
                  style={{
                    marginTop: "10px",
                    padding: "8px",
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Remove
                </button>
              </>
            )}
          </div>
        ))}

      </div>

      {cartItems.length > 0 && (
        <div style={{ marginTop: "30px", textAlign: "center" }}>
          <h2>Total: ₹{totalAmount}</h2>
          <button onClick={checkoutCart} style={{ padding: "10px 20px", backgroundColor: "#28a745", color: "white", borderRadius: "5px" }}>
            Checkout Cart
          </button>
        </div>
      )}
    </div>
  );
};

export default MyCart;
