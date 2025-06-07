import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { SessionContext } from '../../context/SessionContext';
import { FaFileAlt, FaRobot } from 'react-icons/fa';
import './Results.css';

const Results = () => {
  const { summary } = useContext(SessionContext);
  const navigate = useNavigate();
  const [paperTopic, setPaperTopic] = useState('');

  useEffect(() => {
    if (!summary) {
      navigate('/upload');
    }
  }, [summary, navigate]);

  useEffect(() => {
    const fetchPaperTopic = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/paper-topic', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: summary }),
        });
        const data = await response.json();
        setPaperTopic(data.topic);
        sessionStorage.setItem('paperTopic', data.topic);
      } catch (error) {
        console.error('Error fetching paper topic:', error);
      }
    };

    if (summary) {
      fetchPaperTopic();
    }
  }, [summary]);

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
          </div>
          <div className="paper-topic-content">
            {paperTopic ? (
              <p>Paper is classified in field of: "{paperTopic}"</p>
            ) : (
              <p>Paper is classified in field of: "Loading..."</p>
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
