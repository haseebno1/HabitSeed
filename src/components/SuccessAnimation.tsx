
import React from "react";
import { motion } from "framer-motion";

interface SuccessAnimationProps {
  show: boolean;
  emoji: string;
}

const SuccessAnimation = ({ show, emoji }: SuccessAnimationProps) => {
  if (!show) return null;

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
      {/* Large center emoji */}
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

      {/* Confetti-like small emojis */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: 0,
            y: 0,
            scale: 0.2,
            opacity: 0 
          }}
          animate={{ 
            x: Math.random() * 140 - 70,
            y: Math.random() * -100 - 20,
            scale: Math.random() * 0.5 + 0.3,
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 1 + Math.random() * 0.5,
            delay: Math.random() * 0.2,
            ease: "easeOut"
          }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        >
          <span className="text-lg">{emoji}</span>
        </motion.div>
      ))}
    </div>
  );
};

export default SuccessAnimation;
