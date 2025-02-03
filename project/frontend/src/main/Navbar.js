import React from 'react';
import { NavLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate(); // React Router v6 navigation hook
  
  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove the token from localStorage
    localStorage.setItem('token', ''); // Set an empty token in localStorage
    localStorage.clear(); // Clear all items in localStorage

    document.cookie = 'rc::a=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;';
    document.cookie = 'rc::f=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;';
    document.cookie = 'mapslitepromosdismissed=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;';

     // Clear all cookies
    const cookies = document.cookie.split(";");

    cookies.forEach(cookie => {
      const cookieName = cookie.split("=")[0].trim();
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`; // Clear cookie by setting an expired date
    });
    navigate('/login'); // Redirect to login page
  };
  return (
    <nav className="navbar">
      <ul className="navbar-links">
        <li>
          <NavLink to="/"  className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            RegisterPage
          </NavLink>
        </li>
        <li>
          <NavLink to="/login"  className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
          LoginPage
          </NavLink>
        </li>
        <li>
          <NavLink to="/search-items"  className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Search Items
          </NavLink>
        </li>
        <li>
          <NavLink to="/orders"  className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Your Orders
          </NavLink>
        </li>
        <li>
          <NavLink to="/my-cart"  className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            My Cart
          </NavLink>
        </li>
        <li>
          <NavLink to="/deliver-items"  className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Deliver Items
          </NavLink>
        </li>
        <li>
          <NavLink to="/profile"  className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Your Profile
          </NavLink>
        </li>
        <li>
          <NavLink to="/support"  className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Support
          </NavLink>
        </li>
        <li>
          {/* Logout Button */}
          <button className="nav-link logout-button" onClick={handleLogout}>
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
