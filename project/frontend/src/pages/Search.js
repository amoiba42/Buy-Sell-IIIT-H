import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get("http://localhost:5001/api/all-items", {
          headers: {
            Authorization: `Bearer ${token}`, // Attach the token in the headers
          },
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

  // Filtered & Sorted Items
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
      if (sortOption === "price-low-to-high") {
        return a.price - b.price;
      } else if (sortOption === "price-high-to-low") {
        return b.price - a.price;
      }
      return 0;
    });

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>Search Items</h1>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search for items..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ margin: "10px 0", padding: "8px", width: "100%", maxWidth: "400px" }}
      />

      {/* Filters */}
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", margin: "10px 0" }}>
        <div>
          <h3>Condition:</h3>
          {["New", "Barely Used", "Used Enough"].map((condition) => (
            <label key={condition} style={{ marginRight: "10px" }}>
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

        <div>
          <h3>Category:</h3>
          {["Electronics", "Furniture", "Books"].map((category) => (
            <label key={category} style={{ marginRight: "10px" }}>
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
      <div>
        <h3>Sort By:</h3>
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          style={{ margin: "10px", padding: "8px" }}
        >
          <option value="latest">Latest</option>
          <option value="price-low-to-high">Price: Low to High</option>
          <option value="price-high-to-low">Price: High to Low</option>
        </select>
      </div>

      {/* Items Display */}
      <div style={{ marginTop: "20px" }}>
        {loading ? (
          <p>Loading items...</p>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : filteredItems.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
              gap: "20px",
              justifyItems: "center",
            }}
          >
            {filteredItems.map((item) => (
              <div
                key={item.itemId} // Using itemId instead of _id
                style={{
                  border: "1px solid #ccc",
                  padding: "10px",
                  borderRadius: "10px",
                  boxShadow: "2px 2px 10px rgba(0,0,0,0.1)",
                  width: "100%",
                  maxWidth: "300px",
                  textAlign: "center",
                }}
              >
                <h3>{item.name}</h3>
                <p>Price: ₹{item.price}</p>
                <p>Condition: {item.condition}</p>
                <p>Category: {item.category}</p>
                <button
                  onClick={() => navigate(`/items/${item.itemId}`)} // Navigate using itemId
                  style={{
                    marginTop: "10px",
                    padding: "8px",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
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
