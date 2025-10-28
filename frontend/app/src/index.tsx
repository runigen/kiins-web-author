import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

if (process.env.REACT_APP_MODE === 'prd') {
    console.log = () => {};
    console.debug = () => {};
    console.dir = () => {};
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');
const root = ReactDOM.createRoot(rootElement);

root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);
