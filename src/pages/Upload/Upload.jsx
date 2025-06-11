import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import OptionCard from '../../components/OptionCard/OptionCard';
import { SessionContext } from '../../context/SessionContext';
import './Upload.css';

const options = [
  {
    key: 'custom-models',
    title: 'AI-Powered Summary',
    description: 'Get a comprehensive summary using our advanced AI models, optimized for scientific papers with accurate handling of text, tables, and figures.',
  },
  {
    key: 'external-api-full',
    title: 'Expert Analysis',
    description: 'Use external LLM models to analyse & summarize your paper.',
  },
];

const Upload = () => {
  const { processingOption, setProcessingOption } = useContext(SessionContext);
  const [selectedOption, setSelectedOption] = useState(processingOption || '');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [summaryLength, setSummaryLength] = useState('');
  const [lengthError, setLengthError] = useState('');
  const [tempLength, setTempLength] = useState('');
  const navigate = useNavigate();

  const handleOptionSelect = (key) => {
    setSelectedOption(key);
    setProcessingOption(key);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    const maxSize = 20 * 1024 * 1024; // 20MB in bytes

    if (selectedFile && selectedFile.size > maxSize) {
      setError('File size exceeds 20MB limit. Please choose a smaller file.');
      e.target.value = ''; // Clear the file input
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError('');
  };

  const validateLength = (value) => {
    if (value === '') {
      setLengthError('');
      return true;
    }

    const numValue = parseInt(value);
    
    if (isNaN(numValue)) {
      setLengthError('Please enter a valid number');
      return false;
    }

    if (numValue > 500) {
      setLengthError('Maximum summary length is 500 words');
      return false;
    }
    
    if (numValue < 50) {
      setLengthError('Minimum summary length is 50 words');
      return false;
    }

    setLengthError('');
    return true;
  };

  const handleSummaryLengthChange = (e) => {
    const value = e.target.value;
    setTempLength(value);
    
    if (value === '') {
      setSummaryLength('');
      setLengthError('');
    } else {
      const numValue = parseInt(value);
      if (!isNaN(numValue)) {
        setSummaryLength(numValue);
      }
    }
  };

  const handleSummaryLengthBlur = () => {
    if (tempLength === '') {
      setLengthError('');
      return;
    }

    const numValue = parseInt(tempLength);
    if (isNaN(numValue)) {
      setLengthError('Please enter a valid number');
      return;
    }

    if (numValue > 500) {
      setLengthError('Maximum summary length is 500 words');
      setTempLength('500');
      setSummaryLength(500);
    } else if (numValue < 50) {
      setLengthError('Minimum summary length is 50 words');
      setTempLength('50');
      setSummaryLength(50);
    } else {
      setLengthError('');
      setTempLength(numValue.toString());
      setSummaryLength(numValue);
    }
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
    if (tempLength && !validateLength(tempLength)) {
      return;
    }

    // Clear all chat-related data from sessionStorage
    sessionStorage.removeItem('chatHistory');
    sessionStorage.removeItem('chatMessages');
    sessionStorage.removeItem('currentChat');
    sessionStorage.removeItem('chatContext');
    sessionStorage.removeItem('chatState');
    
    // Save file and summary length to sessionStorage
    const reader = new FileReader();
    reader.onload = () => {
      sessionStorage.setItem('uploadedFile', reader.result);
      if (summaryLength) {
        sessionStorage.setItem('summaryLength', summaryLength.toString());
      }
      navigate('/processing');
    };
    reader.readAsDataURL(file);
  };

  return (
    <section className="upload-section container py-4">
      <h2 className="mb-4" style={{ color: 'var(--primary-color)' }}>Upload Your Scientific Paper</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4 d-flex justify-content-center gap-4">
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
          <div id="fileHelp" className="form-text">
            Max size: 20MB. Supported format: PDF
          </div>
        </div>
        <div className="mb-3">
          <label htmlFor="summaryLength" className="form-label">Summary Length (words) - Optional:</label>
          <input
            id="summaryLength"
            type="number"
            min="50"
            max="500"
            value={tempLength}
            onChange={handleSummaryLengthChange}
            onBlur={handleSummaryLengthBlur}
            className={`form-control ${lengthError ? 'is-invalid' : ''}`}
            aria-describedby="lengthHelp"
            placeholder="Enter length (50-500 words) or leave empty for default"
          />
          <div id="lengthHelp" className="form-text">
            Optional: Enter desired summary length (50-500 words). Leave empty for default length.
          </div>
          {lengthError && (
            <div className="invalid-feedback">
              {lengthError}
            </div>
          )}
        </div>
        {error && (
          <div className="alert alert-danger d-flex align-items-center" role="alert">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-exclamation-triangle-fill flex-shrink-0 me-2" viewBox="0 0 16 16" role="img" aria-label="Warning:">
              <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
            </svg>
            <div>{error}</div>
          </div>
        )}
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

