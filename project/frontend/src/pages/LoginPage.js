import React, { useState, useRef,useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';

const LoginPage = () => {
  const navigate = useNavigate(); // React Router v6 navigation hook
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const captcharef = useRef(); // Create a ref for the ReCAPTCHA

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/profile');
    }
  }, [navigate]);

  // Handle reCAPTCHA response
  const handleRecaptchaChange = (value) => {
    setRecaptchaToken(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();


    // Reset the ReCAPTCHA
    if (captcharef.current) {
      captcharef.current.reset();
    }

    try {
      const response = await axios.post('http://localhost:5001/api/auth/login', {
        email,
        password,
        recaptchaToken, // Include the reCAPTCHA token in the request body
      });

      if (response.status === 200) {
        const { message, token } = response.data;

        // Store token in localStorage
        localStorage.setItem('token', token);
        console.log('set token on login');
        console.log('Token:', token);
        setSuccess(message);

        // Redirect to the dashboard
        setTimeout(() => {
          navigate('/profile');
        }, 1000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
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
    error: {
      color: 'red',
      marginBottom: '10px',
    },
    success: {
      color: 'green',
      marginBottom: '10px',
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
        <h2>Login</h2>
        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}

        <div style={styles.inputGroup}>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <ReCAPTCHA
            sitekey="6LcAHMQqAAAAAM1BZXN9L8Utqpvlv6Pb5aXi0Fix" // Replace with your actual Google reCAPTCHA site key
            onChange={handleRecaptchaChange}
            ref={captcharef} // Attach the ref to the ReCAPTCHA component
          />
        </div>

        <button type="submit" style={styles.button}>
          Login
        </button>

        <div
          style={styles.link}
          onClick={() => navigate('/')} // Redirect to register page
        >
          Register here
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
