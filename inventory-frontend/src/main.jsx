// src/main.jsx or src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
    <ToastContainer
      position="bottom-right"
      autoClose={4000}
      hideProgressBar={false}
      newestOnTop={true}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      style={{
        fontSize: '14px',
        fontFamily: 'inherit',
      }}
      toastStyle={{
        borderRadius: '12px',
        background: '#fff',
        color: '#374151',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e5e7eb',
        padding: '12px 16px',
        minHeight: '60px',
      }}
      progressStyle={{
        background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
        height: '3px',
      }}
    />
  </React.StrictMode>
);