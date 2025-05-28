import React, { createContext, useState, useEffect } from 'react';

export const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [summary, setSummary] = useState(() => JSON.parse(localStorage.getItem('summary')) || '');
  const [chatHistory, setChatHistory] = useState(() => JSON.parse(localStorage.getItem('chatHistory')) || []);
  const [processingOption, setProcessingOption] = useState(() => localStorage.getItem('processingOption') || '');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    localStorage.setItem('summary', JSON.stringify(summary));
  }, [summary]);

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  }, [chatHistory]);

  useEffect(() => {
    localStorage.setItem('processingOption', processingOption);
  }, [processingOption]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [theme]);

  const resetSession = () => {
    setSummary('');
    setChatHistory([]);
    setProcessingOption('');
    localStorage.removeItem('summary');
    localStorage.removeItem('chatHistory');
    localStorage.removeItem('processingOption');
  };

  return (
    <SessionContext.Provider value={{
      summary,
      setSummary,
      chatHistory,
      setChatHistory,
      processingOption,
      setProcessingOption,
      theme,
      setTheme,
      resetSession
    }}>
      {children}
    </SessionContext.Provider>
  );
};


