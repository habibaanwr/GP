import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => (
  <section className="home-section text-center">
    <div className="container py-5">
      <h1 className="display-4 fw-bold mb-3" style={{ color: 'var(--primary-color)' }}>Welcome to PolySumm</h1>
      <p className="lead mb-4">
        Scientific paper summarization made easy and efficient with AI-powered tools.
      </p>
      <Link 
        to="/upload" 
        className="btn btn-lg"
        style={{ 
          backgroundColor: 'var(--btn-bg)', 
          borderColor: 'var(--btn-bg)',
          color: 'white'
        }}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'var(--btn-hover-bg)')}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'var(--btn-bg)')}
      >
        Get Started
      </Link>
    </div>
  </section>
);

export default Home;

