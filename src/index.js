import React from 'react';
import ReactDOM from 'react-dom/client'; // Use the new createRoot method for React 18+
import './index.css';
import App from './App.jsx';  // Ensure the filename matches App.jsx

const root = ReactDOM.createRoot(document.getElementById('root')); // Create root using React 18+
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
