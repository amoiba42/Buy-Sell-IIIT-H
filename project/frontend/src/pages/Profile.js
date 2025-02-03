import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const token = localStorage.getItem("token");
  console.log('Token in Profile:', token);
  const navigate = useNavigate();
  const [editable, setEditable] = useState(false);
  const [formData, setFormData] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch the user profile from the API using the token
  useEffect(() => {
    console.log('Token:', token); 
    if (!token) {
      navigate('/login'); // Redirect to login if no token
      return;
    }

    const fetchUserProfile = async () => {
      if (token) {
        try {
          const response = await axios.get('http://localhost:5001/api/user/profile', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setFormData(response.data);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching profile:', error);
          setLoading(false);
        }
      }
    };

    fetchUserProfile();
  }, [token]);

  const validateField = (name, value) => {
    let error = '';
    if (name === 'age') {
      if (value < 0) error = 'Age cannot be negative.';
      else if (!/^\d*$/.test(value)) error = 'Age must be a positive number.';
    }
    if (name === 'contactNumber') {
      if (!/^\d*$/.test(value)) error = 'Phone number can only contain digits.';
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    const hasErrors = Object.values(errors).some((err) => err);
    if (!hasErrors) {
      try {
        const response = await axios.put('http://localhost:5001/api/user/profile', formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFormData(response.data.user);
        setEditable(false);
        alert('Profile updated successfully.');
      } catch (error) {
        console.error('Error updating profile:', error);
        alert('Failed to update profile.');
      }
    } else {
      alert('Please fix errors before saving.');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!formData) {
    return <p>Error: Profile data is not available.</p>;
  }

  const displayFields = ['firstName', 'lastName', 'email', 'age', 'contactNumber', 'itemsInCart', 'sellerReviews'];

  return (
    <div className="profile-box">
      <div className="profile-header">
        <h2>Profile</h2>
        <button onClick={() => setEditable(!editable)} className="edit-btn">
          {editable ? 'Cancel' : 'Edit'}
        </button>
      </div>
      <div className="profile-content">
        {displayFields.map((key) => (
          <div key={key} className="profile-field">
            <label>{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}:</label>
            {editable && key !== 'itemsInCart' && key !== 'sellerReviews' ? (
              <input
                type={key === 'age' || key === 'contactNumber' ? 'text' : 'text'}
                name={key}
                value={formData[key]}
                onChange={handleChange}
                className={errors[key] ? 'error' : ''}
              />
            ) : (
              <p>{key === 'itemsInCart' ? formData[key].length : formData[key]}</p>
            )}
            {errors[key] && <small className="error-message">{errors[key]}</small>}
          </div>
        ))}
        {editable && (
          <button className="save-button" onClick={handleSave}>
            Save
          </button>
        )}
      </div>
    </div>
  );
};

export default Profile;
