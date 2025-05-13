
import React from "react";
import { motion } from "framer-motion";

interface SuccessAnimationProps {
  show: boolean;
  emoji: string;
}

const SuccessAnimation = ({ show, emoji }: SuccessAnimationProps) => {
  if (!show) return null;

  return (
    <motion.div
      initial={{ scale: 0.5, y: 0, opacity: 0 }}
      animate={{ 
        scale: 1.2, 
        y: -20, 
        opacity: [0, 1, 0.8, 0] 
      }}
      transition={{ 
        duration: 1,
        times: [0, 0.2, 0.8, 1]
      }}
      className="absolute top-0 left-1/2 transform -translate-x-1/2 pointer-events-none"
    >
      <span className="text-4xl">{emoji}</span>
    </motion.div>
  );
};

export default SuccessAnimation;
