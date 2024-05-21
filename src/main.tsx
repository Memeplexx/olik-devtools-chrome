import ReactDOM from 'react-dom/client'
import {App} from './app';
import './index.css'
import './shared/polyfills';
import '@fontsource/roboto';
import React from 'react';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
