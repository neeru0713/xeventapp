import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import './styles.css';
import { AuthProvider } from './state/AuthContext';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);
