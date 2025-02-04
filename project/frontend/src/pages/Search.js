import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Search.css"; // Import the CSS file

const Search = () => {
  const [searchText, setSearchText] = useState("");
  const [conditionFilters, setConditionFilters] = useState([]);
  const [categoryFilters, setCategoryFilters] = useState([]);
  const [sortOption, setSortOption] = useState("latest");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get("http://localhost:5001/api/all-items", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setItems(response.data);
      } catch (error) {
        console.error("Error fetching items:", error);
        setError(error.response?.data?.message || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [token, navigate]);

  const filteredItems = items
    .filter((item) => {
      if (searchText && !item.name.toLowerCase().includes(searchText.toLowerCase())) {
        return false;
      }
      if (conditionFilters.length > 0 && !conditionFilters.includes(item.condition)) {
        return false;
      }
      if (categoryFilters.length > 0 && !categoryFilters.includes(item.category)) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortOption === "price-low-to-high") return a.price - b.price;
      if (sortOption === "price-high-to-low") return b.price - a.price;
      return 0;
    });

  return (
    <div className="search-container">
      <h1 className="search-header">Search Items</h1>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search for items..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      {/* Filters */}
      <div className="filters-container">
        <div className="filter-group">
          <h3>Condition:</h3>
          {["New", "Barely Used", "Used Enough"].map((condition) => (
            <label key={condition}>
              <input
                type="checkbox"
                value={condition}
                onChange={(e) => {
                  const value = e.target.value;
                  setConditionFilters((prev) =>
                    prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]
                  );
                }}
              />
              {condition}
            </label>
          ))}
        </div>

        <div className="filter-group">
          <h3>Category:</h3>
          {["Electronics", "Furniture", "Books"].map((category) => (
            <label key={category}>
              <input
                type="checkbox"
                value={category}
                onChange={(e) => {
                  const value = e.target.value;
                  setCategoryFilters((prev) =>
                    prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]
                  );
                }}
              />
              {category}
            </label>
          ))}
        </div>
      </div>

      {/* Sort Options */}
      <div className="sort-container">
        <h3>Sort By:</h3>
        <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
          <option value="latest">Latest</option>
          <option value="price-low-to-high">Price: Low to High</option>
          <option value="price-high-to-low">Price: High to Low</option>
        </select>
      </div>

      {/* Items Display */}
      <div>
        {loading ? (
          <p>Loading items...</p>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : filteredItems.length > 0 ? (
          <div className="items-grid">
            {filteredItems.map((item) => (
              <div key={item.itemId} className="item-card">
                <h3>{item.name}</h3>
                <p>Price: ₹{item.price}</p>
                <p>Condition: {item.condition}</p>
                <p>Category: {item.category}</p>
                <p>Seller: {item.sellerId ? `${item.sellerId.firstName} ${item.sellerId.lastName}` : "Unknown"}</p>
                <button onClick={() => navigate(`/items/${item.itemId}`)} className="view-item-btn">
                  View Item
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p>No items found.</p>
        )}
      </div>
    </div>
  );
};

export default Search;
