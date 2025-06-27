import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports';          // auto-generated
import App from './App.tsx';
import './index.css';

Amplify.configure(awsExports);                  // configure Amplify once

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
