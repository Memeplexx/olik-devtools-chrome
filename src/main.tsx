// import React from 'react'
import ReactDOM from 'react-dom/client'
import {App} from './app';
import './index.css'
import './shared/polyfills';
import { augmentOlikForReact } from 'olik-react';
import "@fontsource/roboto";
import React from 'react';

augmentOlikForReact()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
  ,
)
