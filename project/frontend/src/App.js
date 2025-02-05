  import React from 'react';
  import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
  import Navbar from './main/Navbar';
  import Dashboard from './pages/Dashboard';
  import Profile from './pages/Profile';
  import Orders from './pages/Orders';
  import DeliverItems from './pages/DeliverItems2';
  import MyCart from './pages/MyCart';
  import Support from './pages/Support';
  import Search from './pages/Search';
  import ItemPage from './pages/ItemPage';
  import RegisterPage from './pages/RegisterPage';
  import LoginPage from './pages/LoginPage';
  import AllItems from './pages/AllItems';
  import AuthRoute from './main/AuthRoute';
  import CasAuthHandler from './pages/CasAuthHandler';

  const App = () => {
    return (
      <Router>
        <Navbar />
        <div className="content">
        <Routes>
    {/* Your page content goes here */}

          <Route path="/" exact element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cas-auth" element={<CasAuthHandler />} />
         {/* Protected Routes - Require Authentication */}
          <Route path="/profile" exact element={<AuthRoute element={<Profile />} />} />
          <Route path="/dashboard" exact element={<AuthRoute element={<Dashboard />} />} />
          <Route path="/search-items" exact element={<AuthRoute element={<Search />} />} />
          <Route path="/items/:id" element={<AuthRoute element={<ItemPage />} />} />
          <Route path="/orders" exact element={<AuthRoute element={<Orders />} />} />
          <Route path="/deliver-items" exact element={<AuthRoute element={<DeliverItems />} />} />
          <Route path="/all-items" exact element={<AuthRoute element={<AllItems />} />} />
          <Route path="/my-cart" exact element={<AuthRoute element={<MyCart />} />} />
          <Route path="/support" exact element={<AuthRoute element={<Support />} />} />
        </Routes>
          </div>
      </Router>
    );
  };

  export default App;
