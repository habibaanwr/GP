import React from 'react';
import './About.css';

const About = () => (
  <section className="about-section py-4">
    <div className="container">
      <h2 className="mb-3" style={{ color: 'var(--primary-color)' }}>About PolySumm</h2>
      <p>
        PolySumm is an advanced scientific paper summarization tool designed to help researchers
        quickly extract key insights from complex documents.
      </p>
      <p>
        It offers three summary options:
        <ul>
          <li>Use customized AI models.</li>
          <li>Use external APIs for individual parts (text, tables, figures).</li>
          <li>Send the entire paper to an external API for full processing.</li>
        </ul>
      </p>
      <p>
        PolySumm supports dark and light modes and aims to provide a seamless user experience.
      </p>
      <p>
        Developed by OUR TEAM as a graduation project.
      </p>
    </div>
  </section>
);

export default About;
