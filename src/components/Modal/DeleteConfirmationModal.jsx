// src/components/Modal/DeleteConfirmationModal.jsx
'use client';

import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  title = "Konfirmasi Penghapusan",
  message, 
  confirmText = "Hapus",
  cancelText = "Batal"
}) {
  if (!isOpen) return null;

  const defaultMessage = `Apakah Anda benar-benar yakin ingin menghapus URL dengan kode "${itemName}"? Tindakan ini tidak dapat dibatalkan dan semua data terkait akan hilang selamanya.`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black bg-opacity-75 backdrop-blur-sm" // Tingkatkan z-index jika perlu
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
          onClick={onClose} // Memungkinkan menutup modal dengan klik di luar area konten
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()} // Mencegah penutupan modal saat klik di dalam konten
          >
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-700">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-500/20 flex items-center justify-center mr-3 sm:mr-4">
                  <FaExclamationTriangle className="text-red-400 text-xl sm:text-2xl" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white" id="modal-title">
                  {title}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-slate-700 transition-colors"
                aria-label="Tutup modal"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <div className="p-4 sm:p-6">
              <p className="text-sm sm:text-base text-slate-300">
                {message || defaultMessage}
              </p>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 p-4 sm:p-5 bg-slate-800/50 border-t border-slate-700">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
