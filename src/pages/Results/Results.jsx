import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { SessionContext } from '../../context/SessionContext';
import './Results.css';

const Results = () => {
  const { summary } = useContext(SessionContext);
  const navigate = useNavigate();

  if (!summary) {
    navigate('/upload');
    return null;
  }

  const openChat = () => {
    navigate('/chat');
  };

  return (
    <section className="results-section container py-4">
      <h2 style={{ color: 'var(--primary-color)' }}>Summary</h2>
      <div className="summary-box p-3 mb-4" style={{ backgroundColor: 'var(--nav-bg)', color: 'var(--text-color)', borderRadius: '0.4rem' }}>
        {summary}
      </div>
      <button
        className="btn btn-success"
        onClick={openChat}
        style={{ backgroundColor: 'var(--btn-bg)', borderColor: 'var(--btn-bg)' }}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'var(--btn-hover-bg)')}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'var(--btn-bg)')}
      >
        Ask More
      </button>
    </section>
  );
};

export default Results;
