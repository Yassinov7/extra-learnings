// src/components/ui/Modal.jsx
export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-navy/70 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-navy">{title}</h3>
          <button
            onClick={onClose}
            className="text-navy hover:text-orange transition"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
