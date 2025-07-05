import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="glass-card-dark rounded-2xl p-8 w-full max-w-md mx-4 animate-slide-up">
        <h2 className="text-2xl font-bold gradient-text-primary mb-6">
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
};

export default Modal;
