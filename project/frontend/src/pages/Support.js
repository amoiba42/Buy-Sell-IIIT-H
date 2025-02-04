import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Support.css';

const Support = () => {
  const [messages, setMessages] = useState([]);
  const [userMessage, setUserMessage] = useState('');
  const [sessionId, setSessionId] = useState(''); // Unique session ID for tracking

  useEffect(() => {
    // Generate or fetch session ID when the component mounts
    const storedSessionId = localStorage.getItem('sessionId');
    if (!storedSessionId) {
      const newSessionId = 'session-' + Date.now();
      localStorage.setItem('sessionId', newSessionId);
      setSessionId(newSessionId);
    } else {
      setSessionId(storedSessionId);
    }
  }, []);

  const handleSendMessage = async () => {
    if (userMessage.trim() === '') return;

    // Display user's message
    setMessages((prev) => [...prev, { sender: 'user', text: userMessage }]);
    setUserMessage('');

    try {
      // Send the message to the backend for processing
      const response = await axios.post('http://localhost:5001/api/chat', {
        sessionId,
        userMessage,
      });

      // Display bot's response
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: response.data.botMessage },
      ]);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-box">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender === 'user' ? 'user' : 'bot'}`}>
            <p>{message.text}</p>
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && userMessage.trim() !== "") {
              handleSendMessage();
            }
          }}
          placeholder="Type your message..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Support;
