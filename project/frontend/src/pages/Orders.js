import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/OrderHistory.css"; // Custom styling

const OrderHistory = () => {
  const [completedOrders, setCompletedOrders] = useState([]);
  const [purchasedItems, setPurchasedItems] = useState([]);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  // Fetch user's completed orders (as a seller)
  useEffect(() => {
    const fetchCompletedOrders = async () => {
      try {
        console.log("Fetching completed orders...");
        const response = await axios.get("http://localhost:5001/api/orders/completed", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCompletedOrders(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching completed orders:", error);
        setError("Failed to fetch completed orders.");
      }
    };

    const fetchPurchasedItems = async () => {
      try {
        const response = await axios.get("http://localhost:5001/api/orders/purchased", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPurchasedItems(response.data);
      } catch (error) {
        console.error("Error fetching purchased items:", error);
        setError("Failed to fetch purchased items.");
      }
    };

    fetchCompletedOrders();
    fetchPurchasedItems();
  }, [token]);

  return (
    <div className="container">
      <h1>Order History</h1>

      {/* Completed Orders Section */}
      <h2>Orders Completed by You</h2>
      {completedOrders.length === 0 ? (
        <p>No completed orders found.</p>
      ) : (
        <ul className="order-list">
          {completedOrders.map((order) => (
            <li key={order._id} className="order-item">
              <strong>{order.nameofitem}</strong> - ${order.amount}
              <p>Buyer ID: {order.buyerId}</p>
              <p>Status: Closed</p>
            </li>
          ))}
        </ul>
      )}

      {/* Purchased Items Section */}
      <h2>Items Purchased by You</h2>
      {purchasedItems.length === 0 ? (
        <p>No purchased items found.</p>
      ) : (
        <ul className="item-list">
          {purchasedItems.map((item) => (
            <li key={item._id} className="item-card">
              <strong>{item.name}</strong> - ${item.price}
              <p>Category: {item.category}</p>
              <p>Seller ID: {item.sellerId}</p>
              <p>Status: Delivered</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default OrderHistory;
