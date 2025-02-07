# 🛒 Buy-Sell Marketplace

A **feature-rich e-commerce web application** designed for seamless **buying and selling** of items. The platform enables users to **list, search, filter, order, and manage products**, while ensuring secure transactions with OTP-based order completion. Authentication is managed via **CAS login after registration**.

## 🚀 Features

### 🔐 Authentication & User Management
- **Register & Login**: Users can register an account and log in.
- **CAS Authentication**: After registration, users can log in using **CAS authentication**.
- **Profile Page**: Users can edit personal details.

### 🔍 Search & Filter Items
- **Search Items**: Browse all listed products.
- **Filters**: Narrow down search results by **category, condition, etc.**.
- **Sort Options**: Sort items by **date** (newest first) or **price** (low to high, high to low).
- **Search by Name**: Quickly find items by entering a **name or keyword**.

### 📦 Item Listings & Details
- **Item Page**: Every item has a dedicated **detailed view**.
- **Add to Cart**: Users can add items to their **cart** for easy checkout.

### 🛍️ Cart & Order Management
- **My Cart**: View items added to the cart and proceed with placing an order.
- **Order History**: Users can view:
  - **Pending Orders**: Orders awaiting completion.
  - **Completed Orders**: Orders that have been successfully fulfilled.
  - **Buyer & Seller View**: Users can track both **orders they placed** and **orders they received as a seller**.

### 📤 Deliver Items & Order Completion
- **Deliver Items Page**: Shows all orders that the user has sold but not yet completed.
- **OTP-Based Completion**: Orders are completed only after the seller enters the **OTP** provided by the buyer.

---

## ⚙️ Tech Stack

- **Frontend**: React.js
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ORM)
- **Authentication**: CAS Login, JSON Web Tokens (JWT)


---

## 📂 Folder Structure

```
/project
│── backend/       # Node.js Express API
│   ├── models/    # Mongoose schemas
│   ├── routes/    # API routes
│   ├── controllers/ # Business logic
│   ├── middleware/ # Authentication & security middleware
│   ├── config/    # Environment configurations
│   ├── server.js  # Main backend entry point
│── frontend/      # React.js frontend
│   ├── components/  # UI components
│   ├── pages/      # App pages
│   ├── services/   # API calls
│   ├── App.js      # Main React entry point
│── .env           # Environment variables
│── package.json   # Dependencies
│── README.md      # Project documentation
```

---

## 🚦 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/api/auth/register` | Register a new user |
| POST   | `/api/auth/login` | Log in user & get token |
| GET    | `/api/auth/profile` | Fetch logged-in user profile |

### Items
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/items` | Get all items with filters & sorting |
| GET    | `/api/items/:id` | Get a single item by ID |
| POST   | `/api/items` | Add a new item (Seller only) |
| PUT    | `/api/items/:id` | Update item details |
| DELETE | `/api/items/:id` | Delete an item |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/api/orders` | Create a new order |
| GET    | `/api/orders` | Get order history (Buyer & Seller) |
| PATCH  | `/api/orders/:id/complete` | Complete an order with OTP |

---

## 🛠️ Installation & Setup

### Backend
```bash
cd backend
npm install
npm start
```

### Frontend
```bash
cd frontend
npm install
npm start
```

---

## 🛡️ Security & Best Practices
- **JWT-based authentication** for secure API access.
- **OTP-based order completion** prevents unauthorized transactions.
- **MongoDB validation** ensures proper data handling.
- **Middleware protection** against unauthorized access.

---

## 📢 Future Enhancements
- Implement **real-time notifications** for order status.
- Add **wishlist/favorites** feature.
- Add seller reviews functionality
- Integrate **payment gateway** for seamless transactions.

---

## 🤝 Contributing
Contributions are welcome! Feel free to raise an issue or submit a pull request.

---

## 📜 License
This project is licensed under the **MIT License**.

