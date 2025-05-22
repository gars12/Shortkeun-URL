'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaTimesCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

export default function Toast({ 
  message, 
  type = 'success', 
  duration = 1000, 
  isVisible, 
  onClose 
}) {
  // Otomatis menutup toast setelah duration (dalam milidetik)
  useEffect(() => {
    if (isVisible && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, duration]);
  
  // Menentukan warna dan ikon berdasarkan tipe toast
  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return {
          icon: <FaCheckCircle className="text-2xl" />,
          bgClass: 'bg-green-500/10',
          borderClass: 'border-green-500/50',
          textClass: 'text-green-400'
        };
      case 'error':
        return {
          icon: <FaTimesCircle className="text-2xl" />,
          bgClass: 'bg-red-500/10',
          borderClass: 'border-red-500/50',
          textClass: 'text-red-400'
        };
      case 'warning':
        return {
          icon: <FaExclamationCircle className="text-2xl" />,
          bgClass: 'bg-yellow-500/10',
          borderClass: 'border-yellow-500/50',
          textClass: 'text-yellow-400'
        };
      case 'info':
        return {
          icon: <FaInfoCircle className="text-2xl" />,
          bgClass: 'bg-blue-500/10',
          borderClass: 'border-blue-500/50',
          textClass: 'text-blue-400'
        };
      default:
        return {
          icon: <FaInfoCircle className="text-2xl" />,
          bgClass: 'bg-blue-500/10',
          borderClass: 'border-blue-500/50',
          textClass: 'text-blue-400'
        };
    }
  };
  
  const styles = getToastStyles();

  return (
    <AnimatePresence>
      {isVisible && (
        <div 
          className="fixed z-50" 
          style={{
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none'
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className={`backdrop-blur-md border rounded-xl shadow-2xl ${styles.bgClass} ${styles.borderClass} max-w-md w-full mx-4 pointer-events-auto`}
          >
            <div className="p-5 flex flex-col items-center">
              <div className={`${styles.textClass} text-center mb-3`}>
                {styles.icon}
              </div>
              <div className="text-center">
                <p className="text-white text-base font-medium">{message}</p>
              </div>
              <button 
                onClick={onClose} 
                className="mt-4 text-gray-400 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full p-2"
              >
                <FaTimes />
              </button>
            </div>
          </motion.div>
          <div 
            className="fixed inset-0 bg-black/40 -z-10 pointer-events-auto" 
            onClick={onClose}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          ></div>
        </div>
      )}
    </AnimatePresence>
  );
} 