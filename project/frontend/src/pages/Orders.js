  import React, { useState, useEffect } from "react";
  import axios from "axios";
  import "../styles/OrderHistory.css"; // Custom styling
  import bcrypt from "bcryptjs"; // Add bcrypt for OTP hashing

  const OrderHistory = () => {
    const [completedOrdersAsBuyer, setCompletedOrdersAsBuyer] = useState([]);
    const [completedOrdersAsSeller, setCompletedOrdersAsSeller] = useState([]);
    const [pendingOrders, setPendingOrders] = useState([]); // New state for pending orders
    const [error, setError] = useState(null);
    const [orderedItems, setOrderedItems] = useState({}); // State to track ordered items with OTP
    
    const token = localStorage.getItem("token");

    // Fetch user details from token
    const fetchUserFromToken = async () => {
      try {
        const response = await axios.get("http://localhost:5001/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data; // Returns user object
      } catch (error) {
        console.error("Error fetching user:", error);
        setError("Failed to fetch user data.");
        return null;
      }
    };

    useEffect(() => {
      const fetchOrders = async () => {
        const user = await fetchUserFromToken();
        if (!user) return;

        try {
          console.log("Fetching orders...");

          // Fetch completed orders where the user is the buyer
          const buyerResponse = await axios.get("http://localhost:5001/api/orders", {
            headers: { Authorization: `Bearer ${token}` },
            params: { buyerId: user._id, closed: true },
          });
          setCompletedOrdersAsBuyer(buyerResponse.data);

          // Fetch completed orders where the user is the seller
          const sellerResponse = await axios.get("http://localhost:5001/api/orders", {
            headers: { Authorization: `Bearer ${token}` },
            params: { sellerId: user._id, closed: true },
          });
          setCompletedOrdersAsSeller(sellerResponse.data);

          // Fetch pending orders (where the user is the buyer & order is not closed)
          const pendingResponse = await axios.get("http://localhost:5001/api/orders", {
            headers: { Authorization: `Bearer ${token}` },
            params: { buyerId: user._id, closed: false },
          });
          setPendingOrders(pendingResponse.data);
          
        } catch (error) {
          console.error("Error fetching orders:", error);
          setError("Failed to fetch orders.");
        }
      };

      fetchOrders();
    }, [token]); // `token` is the only dependency

    const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

    const hashOtp = async (otp) => {
      return await bcrypt.hash(otp, 10);
    };

    const regenerateOtp = async (orderId) => {
      try {
        const newOtp = generateOtp();
        const hashedOtp = await hashOtp(newOtp);
    
        // // Retrieve order._id from orderedItems state
        // const orderId = orderedItems[item._id]?.orderId;
    
        // if (!orderId) {
        //   console.error("Error: Order ID not found for item", item._id);
        //   setError("Order ID missing. Please try again.");
        //   return;
        // }
    
        await axios.put(
          `http://localhost:5001/api/order/${orderId}`, // Use order._id
          { hashedotp: hashedOtp },
          { headers: { Authorization: `Bearer ${token}` } }
        );
    
        // setOrderedItems((prev) => ({
        //   ...prev,
        //   [item._id]: { ordered: true, orderId: orderId, otp: newOtp },
        // }));
        alert(`New OTP is: ${newOtp}. Please inform the seller.`);
      } catch (error) {
        console.error("Error regenerating OTP:", error);
        setError("Failed to regenerate OTP.");
      }
    };

    return (
      <div className="container">
        <h1>Order History</h1>

        {/* Pending Orders Section */}
        <h2>Your Pending Orders</h2>
        {pendingOrders.length === 0 ? (
          <p>No pending orders found.</p>
        ) : (
          <ul className="order-list">
            {pendingOrders.map((order) => (
              <li key={order._id} className="order-item pending">
                <strong>{order.nameofitem}</strong>  ₹{order.amount}
                <p>Seller Name: {order.sellerId ? `${order.sellerId.firstName} ${order.sellerId.lastName}` : "Unknown" }</p>
                {/* <p>Status: Pending</p> */}
                <button 
                  className="regen-otp-btn" 
                  onClick={() => regenerateOtp(order._id)}
                >
                  Regenerate OTP
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Completed Orders as a Buyer Section */}
        <h2>Your Completed Orders (You bought)</h2>
        {completedOrdersAsBuyer.length === 0 ? (
          <p>No completed orders found as a buyer.</p>
        ) : (
          <ul className="order-list">
            {completedOrdersAsBuyer.map((order) => (
              <li key={order._id} className="order-item">
                <strong>{order.nameofitem}</strong>  ₹{order.amount}
                <p>Seller Name: {order.sellerId ? `${order.sellerId.firstName} ${order.sellerId.lastName}` : "Unknown" }</p>
                {/* <p>Status: Closed</p> */}
              </li>
            ))}
          </ul>
        )}

        {/* Completed Orders as a Seller Section */}
        <h2>Your Completed Orders (You sold)</h2>
        {completedOrdersAsSeller.length === 0 ? (
          <p>No completed orders found as a seller.</p>
        ) : (
          <ul className="order-list">
            {completedOrdersAsSeller.map((order) => (
              <li key={order._id} className="order-item">
                <strong>{order.nameofitem}</strong> ₹{order.amount}
                <p>Buyer Name: {order.buyerId ? `${order.buyerId.firstName} ${order.buyerId.lastName}` : "Unknown" }</p>
                {/* <p>Status: Closed</p> */}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  export default OrderHistory;
