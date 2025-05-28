import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import OptionCard from '../../components/OptionCard/OptionCard';
import { SessionContext } from '../../context/SessionContext';
import './Upload.css';

const options = [
  {
    key: 'custom-models',
    title: 'Use Custom Models',
    description: 'Summarize using our specially fine-tuned models for text, tables, and figures.',
  },
  {
    key: 'external-apis-parts',
    title: 'Use External APIs by Part',
    description: 'Call external APIs for each paper part separately for accurate results.',
  },
  {
    key: 'external-api-full',
    title: 'Send Full Paper to External API',
    description: 'Let the API handle the whole paper and return a complete summary.',
  },
];

const Upload = () => {
  const { processingOption, setProcessingOption } = useContext(SessionContext);
  const [selectedOption, setSelectedOption] = useState(processingOption || '');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleOptionSelect = (key) => {
    setSelectedOption(key);
    setProcessingOption(key);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedOption) {
      setError('Please select a summarization option.');
      return;
    }
    if (!file) {
      setError('Please upload a PDF file.');
      return;
    }
    // Save file to sessionStorage for demo (real: upload to backend or API)
    const reader = new FileReader();
    reader.onload = () => {
      sessionStorage.setItem('uploadedFile', reader.result);
      navigate('/processing');
    };
    reader.readAsDataURL(file);
  };

  return (
    <section className="upload-section container py-4">
      <h2 className="mb-4" style={{ color: 'var(--primary-color)' }}>Upload Your Scientific Paper</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          {options.map((opt) => (
            <OptionCard
              key={opt.key}
              title={opt.title}
              description={opt.description}
              selected={selectedOption === opt.key}
              onSelect={() => handleOptionSelect(opt.key)}
            />
          ))}
        </div>
        <div className="mb-3">
          <label htmlFor="fileUpload" className="form-label">Choose PDF file:</label>
          <input
            id="fileUpload"
            type="file"
            accept="application/pdf"
            className="form-control"
            onChange={handleFileChange}
            aria-describedby="fileHelp"
          />
          <div id="fileHelp" className="form-text">Max size: 20MB</div>
        </div>
        {error && <div className="alert alert-danger" role="alert">{error}</div>}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!file || !selectedOption}
          style={{ backgroundColor: 'var(--btn-bg)', borderColor: 'var(--btn-bg)' }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'var(--btn-hover-bg)')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'var(--btn-bg)')}
        >
          Start Summarization
        </button>
      </form>
    </section>
  );
};

export default Upload;

