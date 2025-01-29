import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './main/Navbar';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import DeliverItems from './pages/DeliverItems';
import MyCart from './pages/MyCart';
import Support from './pages/Support';
import Search from './pages/Search';
import ItemPage from './pages/ItemPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';


const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" exact element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" exact element={<Dashboard />} />
        <Route path="/profile" exact element={<Profile token={localStorage.getItem('token')} />} />
        <Route path="/search-items" exact element={<Search />} /> 
        <Route path="/orders" exact element={<Orders />} />
        <Route path="/deliver-items" exact element={<DeliverItems />} />
        <Route path="/my-cart" exact element={<MyCart />} />
        {/* <Route path="/my-cart" element={MyCart} /> */}
        <Route path="/support" exact element={<Support />} />
        <Route path="/items/:itemId" exact element={<ItemPage />} />
      </Routes>
    </Router>
  );
};

export default App;
