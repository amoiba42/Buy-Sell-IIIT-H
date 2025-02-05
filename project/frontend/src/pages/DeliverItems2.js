import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/DeliverItems2.css"; // Custom CSS for styling

const DeliverItems = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);

  const [newItem, setNewItem] = useState({
    name: "",
    price: "",
    description: "",
    condition: "New",
    category: "Electronics",
    quantity: 1,
  });
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [otp, setOtp] = useState(""); // OTP input state
  const [selectedOrder, setSelectedOrder] = useState(null); // Track selected order for OTP
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false); // OTP modal state

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
  // Fetch user's orders from the backend
  useEffect(() => {
    const fetchOrders = async () => {
      const user = await fetchUserFromToken();  // Assuming this function returns the user object with _id
  
      if (user) {
        try {
          console.log("Fetching orders...");
          const response = await axios.get("http://localhost:5001/api/orders/", {
            headers: { Authorization: `Bearer ${token}` },
            params: { sellerId: user._id, closed: false }, // Fetch pending orders where seller is the user and order is not closed
          });
  
          console.log('API call successful');
          setOrders(response.data);
        } catch (error) {
          console.error("Error fetching orders:", error);
        }
      } else {
        setError('Failed to fetch user data.');
      }
    };
  
    fetchOrders();
  }, [token]);  // The token is passed in as a dependency
  

  // Handle form submission to add a new item
  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5001/api/items",
        { ...newItem },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrders([...orders, response.data]); // Update UI immediately
      setNewItem({ name: "", price: "", description: "", condition: "New", category: "Electronics", quantity: 1 });
      setIsFormVisible(false);
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };


  const handleCloseTransaction = async () => {
    if (!otp || !selectedOrder) return;
  
    try {
      const response = await axios.put(
        `http://localhost:5001/api/orders/${selectedOrder._id}/close`,
        { otp },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      // If the order was successfully closed, update the local state
      setOrders(orders.map((order) =>
        order._id === selectedOrder._id ? { ...order, closed: true } : order
      ));
  
      // Close the OTP modal and reset the OTP input
      setIsOtpModalOpen(false);
      setOtp("");
      setSelectedOrder(null);
    } catch (error) {
      // Handle the error if OTP is incorrect or any other error
      if (error.response && error.response.status === 400) {
        alert(error.response.data.message || 'Incorrect OTP');
      } else {
        alert('Error closing transaction, please try again');
      }
      console.error("Error closing transaction:", error);
    }
  };
  

  // Separate orders: show only pending orders
  const pendingOrders = orders.filter(order => !order.closed);
  // Handle keydown for OTP Modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        // Trigger the confirm button click when Enter key is pressed
        handleCloseTransaction();
      } else if (e.key === 'Escape') {
        // Close the modal when Escape key is pressed
        setIsOtpModalOpen(false);
      }
    };

    if (isOtpModalOpen) {
      // Add the keydown event listener when the OTP modal is open
      document.addEventListener('keydown', handleKeyDown);

      // Cleanup event listener on modal close or component unmount
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOtpModalOpen, otp, selectedOrder]);
  return (
    <div className="container">
      <div className="form-wrapper">
        <h1 className="form-title">My Orders</h1>

        {/* Pending Orders List */}
        <h2 className="form-subtitle">Pending Orders</h2>
        {pendingOrders.length === 0 ? (
          <p className="no-items-message">No pending orders</p>
        ) : (
          <ul className="item-list deliverables">
            {pendingOrders.map((order) => (
              <li key={order._id} className="item-card deliverable-item">
                <strong>{order.itemName}</strong> - ₹{order.amount}
                <p>Buyer: {order.buyerId.firstName} {order.buyerId.lastName}</p>                {/* <p>Quantity: {order.quantity}</p> */}
                {/* <p>Status: {order.closed ? "Closed" : "Pending"}</p> */}
                <button
                  className="btn close-btn"
                  onClick={() => {
                    setSelectedOrder(order);
                    setIsOtpModalOpen(true);
                  }}
                >
                  Close Transaction
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Button to toggle form visibility */}
        <button onClick={() => setIsFormVisible(!isFormVisible)} className="btn toggle-form-btn">
          {isFormVisible ? "Close Form" : "Add Item"}
        </button>

        {/* Add New Item Form */}
        {isFormVisible && (
          <div className="form-wrapper">
            <h2>Add New Item</h2>
            <form onSubmit={handleAddItem} className="form">
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Price:</label>
                <input
                  type="number"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description:</label>
                <textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Condition:</label>
                <select
                  value={newItem.condition}
                  onChange={(e) => setNewItem({ ...newItem, condition: e.target.value })}
                  required
                >
                  {["New", "Barely Used", "Used Enough"].map((condition) => (
                    <option key={condition} value={condition}>
                      {condition}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Category:</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  required
                >
                  {["Electronics", "Furniture", "Books"].map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn">Add Item</button>
            </form>
          </div>
        )}
      </div>

      {/* OTP Modal */}
      {isOtpModalOpen && (
        <div className="otp-modal">
          <div className="otp-content">
            <h3>Enter OTP to Close Transaction</h3>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
            />
            <button className="btn confirm-btn" onClick={handleCloseTransaction}>
              Confirm
            </button>
            <button className="btn cancel-btn" onClick={() => setIsOtpModalOpen(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliverItems;
