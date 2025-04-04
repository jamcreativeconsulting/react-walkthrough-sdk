import React from 'react';
import ReactDOM from 'react-dom/client';
import { WalkthroughProvider } from '@walkthrough-sdk/core';
import { AdminPanel } from '@walkthrough-sdk/admin';
import './styles.css';

const App = () => {
  return (
    <WalkthroughProvider>
      <div className="app">
        <h1>Walkthrough SDK Playground</h1>
        <AdminPanel />
      </div>
    </WalkthroughProvider>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
