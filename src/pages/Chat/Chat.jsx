import React, { useState, useContext, useEffect, useRef } from 'react';
import { SessionContext } from '../../context/SessionContext';
import { FaUserCircle, FaRobot, FaTrash, FaLightbulb } from 'react-icons/fa';
import './Chat.css';

const Chat = () => {
  const { summary } = useContext(SessionContext);
  const [messages, setMessages] = useState(() => {
    // Try to get messages from sessionStorage first
    const sessionMessages = sessionStorage.getItem('chatMessages');
    if (sessionMessages) {
      return JSON.parse(sessionMessages);
    }
    // If no messages in sessionStorage but we have a summary, initialize with summary
    if (summary) {
      const initialMessage = {
        role: 'bot',
        content: `Paper Topic: ${sessionStorage.getItem('paperTopic') || 'Not available'}\n\nSummary:\n${summary}`,
      };
      sessionStorage.setItem('chatMessages', JSON.stringify([initialMessage]));
      return [initialMessage];
    }
    return [];
  });
  const [input, setInput] = useState('');
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const messagesEndRef = useRef(null);
  const paperTopic = sessionStorage.getItem('paperTopic');

  // Save messages to sessionStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem('chatMessages', JSON.stringify(messages));
    }
  }, [messages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize chat with summary if it's a new paper
  useEffect(() => {
    const hasExistingChat = sessionStorage.getItem('chatMessages');
    if (summary && !hasExistingChat) {
      const initialMessage = {
        role: 'bot',
        content: `Paper Topic: ${paperTopic || 'Not available'}\n\nSummary:\n${summary}`,
      };
      setMessages([initialMessage]);
      sessionStorage.setItem('chatMessages', JSON.stringify([initialMessage]));
    }
  }, [summary, paperTopic]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const newUserMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, newUserMessage]);
    setInput('');
    // Clear suggested questions when a message is sent
    setSuggestedQuestions([]);

    // Simulate bot response and generate new questions
    setTimeout(async () => {
      const botMessage = { role: 'bot', content: `Echo: ${input}` };
      setMessages((prev) => [...prev, botMessage]);
      
      // Generate new suggested questions after bot response
      await generateNewQuestions();
    }, 1000);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    if (summary) {
      const initialMessage = {
        role: 'bot',
        content: `Paper Topic: ${paperTopic || 'Not available'}\n\nSummary:\n${summary}`,
      };
      setMessages([initialMessage]);
      sessionStorage.setItem('chatMessages', JSON.stringify([initialMessage]));
    } else {
      setMessages([]);
      sessionStorage.removeItem('chatMessages');
    }
    setSuggestedQuestions([]);
  };

  const generateNewQuestions = async () => {
    setIsLoadingQuestions(true);
    try {
      // TODO: Replace with actual API call to your backend
      // This is a mock implementation
      const mockQuestions = [
        "Can you elaborate on the methodology used?",
        "What are the key assumptions in this research?",
        "How do these findings impact the field?",
        "What future research directions are suggested?"
      ];
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuggestedQuestions(mockQuestions);
    } catch (error) {
      console.error('Error fetching suggested questions:', error);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const requestSuggestedQuestions = async () => {
    setIsLoadingQuestions(true);
    try {
      // TODO: Replace with actual API call to your backend
      // This is a mock implementation
      const mockQuestions = [
        "What are the main findings of this research?",
        "How does this study compare to previous work in the field?",
        "What are the limitations of the methodology used?",
        "What are the potential applications of these findings?"
      ];
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuggestedQuestions(mockQuestions);
    } catch (error) {
      console.error('Error fetching suggested questions:', error);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const handleQuestionClick = (question) => {
    setInput(question);
  };

  return (
    <section className="chat-section container py-4 d-flex flex-column" aria-label="Chat with summary bot">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h2 style={{ color: 'var(--primary-color)', textAlign: 'center' }}>Chat About Summary</h2>
        <div className="d-flex gap-2">
          <button 
            className="btn btn-primary btn-sm" 
            onClick={requestSuggestedQuestions}
            disabled={isLoadingQuestions}
            aria-label="Get suggested questions"
            style={{ 
              backgroundColor: 'var(--btn-bg)', 
              borderColor: 'var(--btn-bg)',
              color: 'white'
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'var(--btn-hover-bg)')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'var(--btn-bg)')}
          >
            <FaLightbulb className="me-1" />
            {isLoadingQuestions ? 'Loading...' : 'Suggest Questions'}
          </button>
          <button 
            className="btn btn-outline-danger btn-sm" 
            onClick={clearChat} 
            aria-label="Clear chat"
          >
            <FaTrash className="me-1" /> Clear
          </button>
        </div>
      </div>
      <div className="chat-box flex-grow-1 overflow-auto mb-3" tabIndex={0}>
        {messages.map((message, index) => (
          <div key={index} className={`chat-bubble ${message.role}`}>
            <div className="icon">
              {message.role === 'user' ? 
                <FaUserCircle size={20} color="#3a0941" /> : 
                <FaRobot size={20} color="#d500f6" />
              }
            </div>
            <div className="message-content">{message.content}</div>
          </div>
        ))}
        {suggestedQuestions.length > 0 && (
          <div className="suggested-questions">
            <h4 className="suggested-questions-title">Suggested Questions:</h4>
            <div className="suggested-questions-list">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  className="suggested-question-btn"
                  onClick={() => handleQuestionClick(question)}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="d-flex gap-2 align-items-center">
        <textarea
          className="chat-input form-control"
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
      </div>
    </section>
  );
};

export default Chat;



