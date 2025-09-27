"use client";

import { useEffect, useState } from 'react';

interface ToastItem {
  id: string;
  message: string;
  timestamp: number;
}

interface ToastProps {
  messages: ToastItem[];
  onRemove: (id: string) => void;
  duration?: number;
}

export default function Toast({ messages, onRemove, duration = 2000 }: ToastProps) {
  useEffect(() => {
    messages.forEach((toast) => {
      const timer = setTimeout(() => {
        onRemove(toast.id);
      }, duration);
      
      return () => clearTimeout(timer);
    });
  }, [messages, onRemove, duration]);

  if (messages.length === 0) return null;

  return (
    <>
      <style jsx>{`
        .toast-container {
          position: fixed;
          top: 2rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          max-height: 80vh;
        }

        .toast {
          background: #3b82f6;
          color: white;
          padding: 1rem 1.5rem;
          border-radius: 0.5rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          animation: slideIn 0.3s ease-out, fadeOut 0.5s ease-in 1.5s forwards;
          max-width: 400px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .toast-content {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .toast-icon {
          width: 1.2rem;
          height: 1.2rem;
          flex-shrink: 0;
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes fadeOut {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(100%);
          }
        }

        @media screen and (max-width: 768px) {
          .toast-container {
            top: 2rem;
            left: 1rem;
            right: 1rem;
            transform: none;
            max-width: none;
            width: auto;
          }

          .toast {
            max-width: none;
            white-space: normal;
            text-overflow: unset;
            overflow: visible;
            width: 100%;
          }
        }
      `}</style>
      <div className="toast-container">
        {messages.slice().reverse().map((toast) => (
          <div key={toast.id} className="toast">
            <div className="toast-content">
              <svg className="toast-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
              <span>{toast.message}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
