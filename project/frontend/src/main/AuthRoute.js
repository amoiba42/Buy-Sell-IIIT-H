import React from "react";
import { Navigate } from "react-router-dom";

const AuthRoute = ({ element }) => {
  const token = localStorage.getItem("token"); // Retrieve token
  if(!token) {
  alert("Please login to access this page");
}
  return token ? element : <Navigate to="/login" replace />;
};

export default AuthRoute;
