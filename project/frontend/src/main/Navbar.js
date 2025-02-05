import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faSignInAlt,
  faSearch,
  faShoppingCart,
  faBoxOpen,
  faUser,
  faHeadset,
  faSignOutAlt,
  faList
} from "@fortawesome/free-solid-svg-icons";
import "../styles/Navbar.css"; // Import the CSS file

const Navbar = () => {
  const navigate = useNavigate();

  // const handleLogout = () => {
  //   localStorage.clear();
  //   document.cookie.split(";").forEach((cookie) => {
  //     document.cookie = `${cookie.split("=")[0].trim()}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
  //   });
  //   window.location.href = "https://login.iiit.ac.in/cas/logout?service=http://localhost:5001/api/auth/cas/callback";
  //   navigate("/login");
  // };

  const handleLogout = () => {
    // Clear localStorage and cookies in your application
    localStorage.clear();
    document.cookie.split(";").forEach((cookie) => {
      document.cookie = `${cookie.split("=")[0].trim()}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
    });
  
    // Redirect to CAS logout URL
    window.location.href = "https://login.iiit.ac.in/cas/logout?service=http://localhost:3000/login";
  };
  
  return (
    <nav className="navbar">
      <ul className="navbar-links">
        <li>
          <NavLink to="/" className="nav-link">
            <FontAwesomeIcon icon={faHome} /> <span>Home</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/login" className="nav-link">
            <FontAwesomeIcon icon={faSignInAlt} /> <span>Login</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/search-items" className="nav-link">
            <FontAwesomeIcon icon={faSearch} /> <span>Search</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/orders" className="nav-link">
            <FontAwesomeIcon icon={faList} /> <span>Orders</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/my-cart" className="nav-link">
            <FontAwesomeIcon icon={faShoppingCart} /> <span>Cart</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/deliver-items" className="nav-link">
            <FontAwesomeIcon icon={faBoxOpen} /> <span>Deliver</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/all-items" className="nav-link">
            <FontAwesomeIcon icon={faList} /> <span>All Items</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/profile" className="nav-link">
            <FontAwesomeIcon icon={faUser} /> <span>Profile</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/support" className="nav-link">
            <FontAwesomeIcon icon={faHeadset} /> <span>Support</span>
          </NavLink>
        </li>
        <li>
          <button className="nav-link logout-button" onClick={handleLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} /> <span>Logout</span>
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
