import React, { useState, useContext, useEffect, useRef } from 'react';
import { SessionContext } from '../../context/SessionContext';
import { FaUserCircle, FaRobot } from 'react-icons/fa'; // أيقونات بوت ويوزر من react-icons
import './Chat.css';

const Chat = () => {
  const { summary } = useContext(SessionContext);
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('chatMessages');
    return saved ? JSON.parse(saved) : summary ? [{ role: 'system', content: summary }] : [];
  });
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const newUserMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, newUserMessage]);
    setInput('');

    // Simulate bot response
    setTimeout(() => {
      const botMessage = { role: 'bot', content: `Echo: ${input}` };
      setMessages((prev) => [...prev, botMessage]);
    }, 1000);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <section className="chat-section container py-4 d-flex flex-column" aria-label="Chat with summary bot">
      <h2 style={{ color: 'var(--primary-color)' }}>Chat About Summary</h2>
      <div className="chat-box flex-grow-1 overflow-auto mb-3" tabIndex={0}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-bubble ${msg.role}`}>
            <div className="icon">
              {msg.role === 'user' ? <FaUserCircle size={30} color="#ff69b4" /> : <FaRobot size={30} color="#ff85c1" />}
            </div>
            <div className="message-content">{msg.content}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <textarea
        className="chat-input form-control mb-2"
        rows={3}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message here..."
        aria-label="Chat input"
      />
      <button
        className="btn btn-primary send-btn"
        onClick={sendMessage}
        aria-label="Send message"
      >
        Send
      </button>
    </section>
  );
};

export default Chat;


