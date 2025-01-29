import React, { useState, useEffect } from "react";
import axios from "axios";

const DeliverItems = ({ userId }) => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    name: "",
    price: "",
    description: "",
    condition: "New",
    category: "Electronics",
    quantity: 1,
  });

  // Fetch user's items from the backend
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/items?sellerId=${userId}`);
        setItems(response.data);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };
    fetchItems();
  }, [userId]);

  // Handle form submission
  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5001/api/items", {
        ...newItem,
        sellerId: userId,
      });
      setItems([...items, response.data]); // Update UI immediately
      setNewItem({ name: "", price: "", description: "", condition: "New", category: "Electronics", quantity: 1 });
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  return (
    <div className="container">
      <div className="form-wrapper">
        <h1 className="form-title">My Items</h1>
        <ul className="item-list">
          {items.map((item) => (
            <li key={item.itemId} className="item-card">
              <strong>{item.name}</strong> - ${item.price}
              <p>{item.description}</p>
              <p>Condition: {item.condition}</p>
              <p>Category: {item.category}</p>
            </li>
          ))}
        </ul>

        <h2 className="form-title">Add New Item</h2>
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
          <div className="form-group">
            <label>Quantity:</label>
            <input
              type="number"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
              max="10"
              min="1"
              required
            />
          </div>
          <button type="submit" className="btn">Add Item</button>
        </form>
      </div>
    </div>
  );
};

export default DeliverItems;
