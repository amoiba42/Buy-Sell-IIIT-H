import React, { useState} from "react";
import { useNavigate } from "react-router-dom"; 

const Search = () => {
  const [searchText, setSearchText] = useState("");
  const [conditionFilters, setConditionFilters] = useState([]);
  const [categoryFilters, setCategoryFilters] = useState([]);
  const [sortOption, setSortOption] = useState("latest");
  const navigate = useNavigate();

  // Example items data
  const items = [
    { 
      itemId: "id",
      name: "Laptop", 
      price: 50000, 
      description: 'A high-performance laptop.',
      condition: "New", 
      category: "Electronics", 
      sellerId: "sellerId_1", // Placeholder, replace with actual seller ID from your User collection
      quantity: 10, // Assume there are 10 items available
    },
    {   
      itemId: "item_2",
      name: "Desk Chair", 
      price: 2000, 
      condition: "Barely Used", 
      category: "Furniture", 
      sellerId: "sellerId_2", // Placeholder, replace with actual seller ID from your User collection
    },
    { 
      itemId: "item_3",
      name: "Textbook", 
      price: 500, 
      condition: "Used Enough", 
      category: "Books", 
      sellerId: "sellerId_3", // Placeholder, replace with actual seller ID from your User collection
    },
  ];
  
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
      // Sorting logic
      if (sortOption === "latest") {
        return new Date(b.date) - new Date(a.date);
      } else if (sortOption === "price-low-to-high") {
        return a.price - b.price;
      } else if (sortOption === "price-high-to-low") {
        return b.price - a.price;
      }
      return 0;
    });

  return (
    <div>
      <h1>Search Items</h1>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search for items..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ margin: "10px", padding: "8px", width: "300px" }}
      />

      {/* Filters */}
      <div>
        <h3>Filter by Condition:</h3>
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
        <h3>Filter by Category:</h3>
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

    <div style={{ marginTop: "20px" }}>
        {filteredItems.length > 0 ? (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", 
        gap: "20px", // Space between grid items
        justifyItems: "center", // Center items in each grid cell
      }}
    >
      {filteredItems.map((item) => (
        <div
          key={item.id}
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            width: "100%", // Ensures that each item takes full width of its grid cell
            boxSizing: "border-box",
          }}
        >
          <h3>{item.name}</h3>
          <p>Price: ₹{item.price}</p>
          <p>Condition: {item.condition}</p>
          <p>Category: {item.category}</p>
          <p>Vendor: {item.vendor}</p>
          <button onClick={() => navigate(`/items/${item.itemId}`)}>View Item</button>
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
