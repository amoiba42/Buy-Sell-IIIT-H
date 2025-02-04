import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/AllItems.css"; // Add custom CSS for styling

const AllItems = () => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    name: "",
    price: "",
    description: "",
    condition: "New",
    category: "Electronics",
    quantity: 1,
  });
  const [isFormVisible, setIsFormVisible] = useState(false); // State for toggling the form visibility

  // Fetch token from localStorage
  const token = localStorage.getItem("token");

  // Fetch user's items from the backend
  useEffect(() => {
    const fetchItems = async () => {
      if (!token) return;
      try {
        const response = await axios.get("http://localhost:5001/api/items", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setItems(response.data);
        console.log('fetched items');
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };
    fetchItems();
  }, [token]);

  // Handle form submission
  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!token) {
      console.error("No token found");
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:5001/api/items",
        { ...newItem },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setItems([...items, response.data]); // Update UI immediately
      setNewItem({ name: "", price: "", description: "", condition: "New", category: "Electronics", quantity: 1 });
      setIsFormVisible(false); // Hide form after submission
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  // Separate items into two lists
  const allItems = items;
  
  return (
    <div className="container">
      <div className="form-wrapper">
        {/* <h1 className="form-title">My Items</h1> */}

        {/* All Items for Sale List */}
        <h2 className="form-subtitle">All Items</h2>
        {allItems.length === 0 ? (
          <p className="no-items-message">No items to display here</p>
        ) : (
          <ul className="item-list all-items">
            {allItems.map((item) => (
              <li key={item._id} className="item-card light-item">
                <strong>{item.name}</strong> - ₹{item.price}
                <p>{item.description}</p>
                <p>Condition: {item.condition}</p>
                <p>Category: {item.category}</p>

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
    </div>
  );
};

export default AllItems;
