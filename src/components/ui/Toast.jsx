// src/components/ui/Toast.jsx
import { useEffect } from 'react';

export default function Toast({ message, type = 'info', onClose }) {
  const bgColor = {
    success: 'bg-green-500',
    error:   'bg-red-500',
    warning: 'bg-yellow-500',
    info:    'bg-sky-600',
  }[type];

  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 right-6 ${bgColor} text-white px-4 py-2 rounded-lg shadow-lg`}>
      {message}
    </div>
  );
}
