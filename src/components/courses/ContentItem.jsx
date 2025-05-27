// src/components/courses/ContentItem.jsx

import React, { useState } from 'react';

export default function ContentItem({ item, onView }) {
  const [open, setOpen] = useState(false);

  return (
    <details
      id={`content-${item.content_id}`}
      className="mb-4 bg-white text-navy rounded-lg shadow-md overflow-hidden"
      onClick={() => {
        setOpen(!open);
        onView(item.content_id);
      }}
    >
      <summary className="px-4 py-2 font-semibold cursor-pointer flex justify-between items-center bg-gray-100 hover:bg-gray-200 transition">
        <span className="truncate">{item.title}</span>
        <span
          className={`text-gray-500 transform transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        >
          ▼
        </span>
      </summary>

      <div className="p-4">
        {/* Common wrapper for responsive sizing */}
        <div className="w-full max-w-screen-lg mx-auto">
          {item.type === 'video' && (
            <div className="aspect-w-16 aspect-h-9">
              <video
                controls
                className="w-full h-full object-cover rounded"
              >
                <source src={item.url} type="video/mp4" />
                المتصفح لا يدعم تشغيل الفيديو
              </video>
            </div>
          )}

          {item.type === 'document' && (
            <div className="w-full h-[60vh] md:h-[75vh] rounded overflow-hidden">
              <iframe
                src={item.url}
                className="w-full h-full"
                title={item.title}
              />
            </div>
          )}

          {item.type === 'image' && (
            <img
              src={item.url}
              alt={item.title}
              className="w-full max-h-[60vh] object-contain rounded"
            />
          )}

          {item.type === 'audio' && (
            <audio controls className="w-full">
              <source src={item.url} />
            </audio>
          )}

          {item.type === 'link' && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange underline"
            >
              فتح الرابط الخارجي
            </a>
          )}
        </div>
      </div>
    </details>
  );
}
