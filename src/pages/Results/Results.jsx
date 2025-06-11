import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { SessionContext } from '../../context/SessionContext';
import { FaFileAlt, FaRobot } from 'react-icons/fa';
import './Results.css';

const Results = () => {
  const { summary, documentId } = useContext(SessionContext);
  const navigate = useNavigate();
  const [paperTopic, setPaperTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    if (!summary) {
      navigate('/upload');
    }
  }, [summary, navigate]);
  useEffect(() => {
    const fetchPaperTopic = async () => {
      if (!summary) return;
      
      setIsLoading(true);
      try {
        // Try multiple approaches to get the paper topic
        let topic = null;
        
        // First approach: Use the dedicated paper-topic endpoint
        try {
          const response = await fetch('http://localhost:5000/api/paper-topic', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: summary }),
          });
          
          if (response.ok) {
            const data = await response.json();
            topic = data.topic;
          }
        } catch (topicError) {
          console.warn('Error using paper-topic endpoint:', topicError);
          // Continue to fallback methods
        }
        
        // Second approach: Attempt to extract from summary content if first approach failed
        if (!topic) {
          // Simple pattern matching to find potential topic indicators in the summary
          const topicPatterns = [
            /(?:paper|article|research|study) (?:on|about|discusses|examines|investigates|explores) (.+?)[.]/i,
            /(?:in the field of|in) (.+?)[,.](?=\s)/i,
            /(?:focuses on|addresses) (.+?)[.]/i
          ];
          
          for (const pattern of topicPatterns) {
            const match = summary.match(pattern);
            if (match && match[1] && match[1].length > 3 && match[1].length < 100) {
              topic = match[1].trim();
              break;
            }
          }
        }
        
        // Set a default if we still couldn't extract a topic
        if (!topic) {
          topic = 'Academic Research';
        }
        
        setPaperTopic(topic);
        sessionStorage.setItem('paperTopic', topic);
      } catch (error) {
        console.error('Error determining paper topic:', error);
        
        // Fallback to a generic topic
        const fallbackTopic = 'Scientific Paper';
        setPaperTopic(fallbackTopic);
        sessionStorage.setItem('paperTopic', fallbackTopic);
      } finally {
        setIsLoading(false);
      }
    };

    if (summary) {
      fetchPaperTopic();
    }
  }, [summary, documentId]);

  if (!summary) {
    return null;
  }

  return (
    <div className="results-container">
      <div className="results-header">
        <h1>Analysis Results</h1>
      </div>

      <div className="results-content">
        <div className="results-section paper-topic-section">
          <div className="section-header">
            <FaFileAlt className="section-icon" />
            <h2>Paper Topic</h2>
          </div>          <div className="paper-topic-content">
            {isLoading ? (
              <p>Paper is classified in field of: "Loading..."</p>
            ) : paperTopic ? (
              <p>Paper is classified in field of: "{paperTopic}"</p>
            ) : (
              <p>Paper is classified in field of: "Unknown"</p>
            )}
          </div>
        </div>

        <div className="results-section summary-section">
          <div className="section-header">
            <FaRobot className="section-icon" />
            <h2>AI Summary</h2>
          </div>
          <div className="summary-content">
            <p>{summary}</p>
          </div>
        </div>

        <div className="action-buttons">
      <button
            className="chat-button"
            onClick={() => navigate('/chat')}
      >
            Chat About Summary
      </button>
        </div>
      </div>
    </div>
  );
};

export default Results;
