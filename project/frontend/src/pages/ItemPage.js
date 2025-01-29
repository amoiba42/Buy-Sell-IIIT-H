import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ItemPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const item = {
    id: id,
    name: 'Laptop',
    price: 50000,
    description: 'A high-performance laptop.',
    image: 'https://via.placeholder.com/300', 
    condition: 'New',
    category: 'Electronics',
    available: 10, 
  };

  const [isInCart, setIsInCart] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const toggleCartStatus = () => {
    if (isInCart) {
      setIsInCart(false);
      alert('Removed from cart');
    } else {
      if (quantity > item.available) {
        alert('Quantity exceeds available stock');
      } else {
        setIsInCart(true);
        alert(`Added ${quantity} to cart`);
      }
    }
  };

  const incrementQuantity = () => {
    if (quantity < item.available) {
      setQuantity(prevQuantity => prevQuantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prevQuantity => prevQuantity - 1);
    }
  };

  return (
    <div>
      <button onClick={() => navigate(-1)}>Go Back</button>
      <h1>{item.name}</h1>
      <img src={item.image} alt={item.name} style={{ width: '300px' }} />
      <p>{item.description}</p>
      <p>Price: ₹{item.price}</p>
      <p>Condition: {item.condition}</p>
      <p>Category: {item.category}</p>
      <p>Available: {item.available}</p>

      <div>
        <button onClick={decrementQuantity} disabled={quantity <= 1}>-</button>
        <span style={{ margin: "0 10px" }}>{quantity}</span>
        <button onClick={incrementQuantity} disabled={quantity >= item.available}>+</button>
      </div>

      <button onClick={toggleCartStatus}>
        {isInCart ? "Remove from Cart" : "Add to Cart"}
      </button>
    </div>
  );
};

export default ItemPage;
