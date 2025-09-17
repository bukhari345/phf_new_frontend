'use client';

import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';

interface ModalProps {
    show: boolean;
    name: string;
    onClose: () => void;
}

const SignupSuccessModal: React.FC<ModalProps> = ({ show, name, onClose }) => {
    const router = useRouter();

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    className="fixed inset-0 flex items-center justify-center z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="bg-white rounded-2xl p-8 text-center shadow-2xl w-[90%] max-w-md border border-gray-100"
                        initial={{ scale: 0.8, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    >
                        {/* Animated Success Icon */}
                        <motion.div
                            className="w-20 h-20 mx-auto mb-6"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 400, damping: 15 }}
                        >
                            <div className="relative">
                                <motion.div
                                    className="absolute inset-0 bg-green-100 rounded-full"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.1 }}
                                />
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
                                    className="relative z-10 flex items-center justify-center w-20 h-20"
                                >
                                    <CheckCircle className="w-12 h-12 text-green-500" />
                                </motion.div>
                            </div>
                        </motion.div>

                        {/* Success Message */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <h2 className="text-2xl font-bold text-[#4B73D6] mb-3">
                                🎉 Signup Successful!
                            </h2>
                            <p className="text-gray-600 mb-6 text-lg">
                                Welcome, <strong className="text-[#4B73D6]">{name}</strong>!
                                <br />
                                Your account has been created successfully.
                            </p>
                        </motion.div>

                        {/* Action Button */}
                     <motion.button
  onClick={() => {
    onClose();
    router.push(`/?name=${encodeURIComponent(name)}`);
  }}
  className="bg-[#4B73D6] text-white px-8 py-3 rounded-xl hover:bg-[#3a60b0] transition-all duration-200 font-medium text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.5 }}
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Continue to Schemes
</motion.button>

                        {/* Close button (X) in top-right corner */}
                        <motion.button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </motion.button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SignupSuccessModal;