import React, { useState,useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// import ReCAPTCHA from 'react-google-recaptcha';

const RegisterPage = () => {
  const navigate = useNavigate(); // React Router v6 navigation hook
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    age: '',
    contactNumber: '',
  });
  
  // const [recaptchaToken, setRecaptchaToken] = useState("");
  // const captcharef = useRef();
  // Handle reCAPTCHA token change
  // const handleRecaptchaChange = (value) => {
  //   setRecaptchaToken(value);
  // };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // if (!recaptchaToken) {
    //   alert('Please complete the reCAPTCHA');
    //   return;
    // }
    // // Reset the ReCAPTCHA
    // if (captcharef.current) {
    //   captcharef.current.reset();
    // }
    //
     try {
      const response = await axios.post('http://localhost:5001/api/auth/register', {
        ...userData,
        // recaptchaToken, // Include the reCAPTCHA token in the request body
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        alert('Registration successful!');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      }
    } catch (error) {
      console.error('Error registering user:', error);
      alert(error.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#f9f9f9',
    },
    form: {
      backgroundColor: '#fff',
      padding: '30px',
      borderRadius: '8px',
      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
      width: '400px',
    },
    inputGroup: {
      marginBottom: '15px',
    },
    input: {
      width: '100%',
      padding: '10px',
      margin: '5px 0',
      borderRadius: '5px',
      border: '1px solid #ccc',
    },
    button: {
      width: '100%',
      padding: '10px',
      backgroundColor: '#007bff',
      color: '#fff',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      fontWeight: 'bold',
    },
    link: {
      textAlign: 'center',
      marginTop: '15px',
      color: '#007bff',
      textDecoration: 'underline',
      cursor: 'pointer',
    },
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2>Register</h2>

        <div style={styles.inputGroup}>
          <label>First Name:</label>
          <input
            type="text"
            name="firstName"
            value={userData.firstName}
            onChange={handleChange}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label>Last Name:</label>
          <input
            type="text"
            name="lastName"
            value={userData.lastName}
            onChange={handleChange}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={userData.email}
            onChange={handleChange}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={userData.password}
            onChange={handleChange}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label>Age:</label>
          <input
            type="number"
            name="age"
            value={userData.age}
            onChange={handleChange}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label>Contact Number:</label>
          <input
            type="text"
            name="contactNumber"
            value={userData.contactNumber}
            onChange={handleChange}
            required
            style={styles.input}
          />
        </div>

        {/* <div style={{ marginBottom: '15px' }}>
          <ReCAPTCHA
            // sitekey="6LcAHMQqAAAAAM1BZXN9L8Utqpvlv6Pb5aXi0Fix" 
            sitekey="6LcAHMQqAAAAAM1BZXN9L8Utqpvlv6Pb5aXi0Fix"// Replace with your actual Google reCAPTCHA site key
            onChange={handleRecaptchaChange}
            ref={captcharef}
          />
        </div>
 */}
        <button type="submit" style={styles.button}>
          Register
        </button>

        <div
          style={styles.link}
          onClick={() => navigate('/login')} // Redirect to login page
        >
          Already have an account? Login instead.
        </div>
      </form>
    </div>
  );
};

export default RegisterPage;
