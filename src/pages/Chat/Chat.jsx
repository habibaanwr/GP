import React, { useState, useContext, useEffect, useRef } from 'react';
import { SessionContext } from '../../context/SessionContext';
import { FaUserCircle, FaRobot, FaTrash, FaLightbulb } from 'react-icons/fa';
import { askQuestionWithRetry, handleApiError } from '../../services/chatApi';
import './Chat.css';
import './typing-indicator.css';

const Chat = () => {
  const { summary, documentId } = useContext(SessionContext);
  
  const [messages, setMessages] = useState(() => {
    // Try to get messages from sessionStorage first
    const sessionMessages = sessionStorage.getItem('chatMessages');
    if (sessionMessages) {
      const parsedMessages = JSON.parse(sessionMessages);
      // Ensure all loaded messages are marked as complete
      return parsedMessages.map(msg => ({ 
        ...msg, 
        isComplete: true, 
        showCursor: false 
      }));
    }
    // If no messages in sessionStorage but we have a summary, initialize with summary
    if (summary) {
      const initialMessage = {
        role: 'bot',
        content: `Paper Topic: ${sessionStorage.getItem('paperTopic') || ''}\n\nSummary:\n${summary || ''}`,
        isComplete: true,
        showCursor: false
      };
      sessionStorage.setItem('chatMessages', JSON.stringify([initialMessage]));
      return [initialMessage];
    }
    return [];
  });
  const [input, setInput] = useState('');
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [typingMessageIndex, setTypingMessageIndex] = useState(null);
  const messagesEndRef = useRef(null);
  const paperTopic = sessionStorage.getItem('paperTopic');
  const inputRef = useRef(null);
  const typingIntervalRef = useRef(null);

  // Function to simulate typing effect
  const typeMessage = (fullText, messageIndex) => {
    let currentIndex = 0;
    setTypingMessageIndex(messageIndex);
    
    const typeNextCharacter = () => {
      if (currentIndex < fullText.length) {
        const nextChar = fullText[currentIndex];
        
        setMessages(prev => {
          const newMessages = [...prev];
          if (newMessages[messageIndex]) {
            newMessages[messageIndex].content = fullText.substring(0, currentIndex + 1);
            newMessages[messageIndex].showCursor = true; // Show cursor while typing
          }
          return newMessages;
        });
        
        currentIndex++;
        
        // Vary typing speed based on character type
        let delay = 15; // Default delay in ms (reduced from 30)
        if (nextChar === ' ') delay = 25; // Reduced from 60
        else if (nextChar === '.' || nextChar === '!' || nextChar === '?') delay = 75; // Reduced from 150
        else if (nextChar === ',' || nextChar === ';') delay = 40; // Reduced from 100
        else if (nextChar === '\n') delay = 80; // Reduced from 200
        
        typingIntervalRef.current = setTimeout(typeNextCharacter, delay);
      } else {
        // Typing complete
        setMessages(prev => {
          const newMessages = [...prev];
          if (newMessages[messageIndex]) {
            newMessages[messageIndex].isComplete = true;
            newMessages[messageIndex].showCursor = false; // Hide cursor when complete
          }
          return newMessages;
        });
        setTypingMessageIndex(null);
        setIsLoading(false);
        
        // Focus the input field after typing is complete
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }
    };
    
    typeNextCharacter();
  };

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
        content: `Paper Topic: ${paperTopic || ''}\n\nSummary:\n${summary || ''}`,
        isComplete: true,
        showCursor: false
      };
      setMessages([initialMessage]);
    }
  }, [summary, paperTopic]);

  // Cleanup typing effect on unmount
  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearTimeout(typingIntervalRef.current);
      }
    };
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;
    
    const userMessage = { role: 'user', content: input.trim(), isComplete: true };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);
    
    try {
      // Add a placeholder for the bot's response
      setMessages(prev => [...prev, { role: 'bot', content: '', isLoading: true, isComplete: false }]);
      
      // Fetch the answer
      const response = await askQuestionWithRetry(userMessage.content, documentId);
      
      // Start typing effect for the response
      const messageIndex = messages.length + 1; // +1 because we added user message
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = { 
          role: 'bot', 
          content: '',
          isComplete: false,
          isLoading: false,
          showCursor: false // Initialize cursor state
        };
        return newMessages;
      });
      
      // Start typing the response
      const responseText = response.answer || 'I could not generate an answer for your question.';
      typeMessage(responseText, messageIndex);
      
    } catch (err) {
      console.error('Error sending message:', err);
      
      // Remove the loading placeholder
      setMessages(prev => prev.filter(msg => !msg.isLoading));
      
      // Handle the error
      const errorInfo = handleApiError(err);
      setError(errorInfo);
      
      // Add an error message from the bot
      setMessages(prev => [
        ...prev, 
        { 
          role: 'bot', 
          content: `I encountered an error: \n\n${errorInfo?.message || 'Unknown error'}`,
          isError: true,
          isComplete: true,
          showCursor: false
        }
      ]);
      setIsLoading(false);
      
      // Focus the input field after error
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
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
    if (window.confirm('Are you sure you want to clear the chat history?')) {
      // Clear any ongoing typing
      if (typingIntervalRef.current) {
        clearTimeout(typingIntervalRef.current);
      }
      setTypingMessageIndex(null);
      
      setMessages(summary ? [{
        role: 'bot',
        content: `Paper Topic: ${paperTopic || ''}\n\nSummary:\n${summary || ''}`,
        isComplete: true,
        showCursor: false
      }] : []);
      sessionStorage.removeItem('chatMessages');
      setError(null);
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
      
      {error && error.message && !error.isHandled && (
        <div className="error-alert">
          <strong>Error:</strong> {error.message}
          {error.suggestion && <div><strong>Suggestion:</strong> {error.suggestion}</div>}
        </div>
      )}

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="empty-chat">
            <p>No messages yet. Start the conversation by asking a question about the document.</p>
          </div>
        )}
        
        {messages.map((message, index) => (
          <div key={index} className={`chat-bubble ${message.role}`}>
            <div className="icon">
              {message.role === 'user' ? 
                <FaUserCircle size={20} color="#3a0941" /> : 
                <FaRobot size={20} color="#d500f6" />
              }
          <div key={index} className={`message ${message.role} ${message.isError ? 'error' : ''}`}>
            <div className="message-avatar">
              {message.role === 'user' ? <FaUserCircle /> : <FaRobot />}
            </div>
            <div className="message-content">
              {message.isLoading ? (
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              ) : (
                <div className="message-text">
                  {(message.content || '').split('\n').map((line, i, lines) => (
                    <React.Fragment key={i}>
                      {line}
                      {/* Show cursor at the end of the last line while typing */}
                      {message.showCursor && i === lines.length - 1 && (
                        <span className="typing-cursor">|</span>
                      )}
                      <br />
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
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

      <form onSubmit={handleSendMessage} className="chat-input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your question here..."
          disabled={isLoading || typingMessageIndex !== null}
          ref={inputRef}
        />
        <button 
          type="submit" 
          disabled={!input.trim() || isLoading || typingMessageIndex !== null}
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default Chat;
