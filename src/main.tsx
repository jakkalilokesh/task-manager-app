// src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports';  // ✅ points to src/aws-exports.js
import App from './App.tsx';
import './index.css';

Amplify.configure(awsExports); // ✅ configure Amplify globally

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
