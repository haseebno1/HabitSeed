import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import iconSvg from '../assets/icon.svg';

interface SplashScreenProps {
  duration?: number;
  onFinish?: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ 
  duration = 2000,
  onFinish 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onFinish) onFinish();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onFinish]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1]
            }}
            className="flex flex-col items-center"
          >
            <img 
              src={iconSvg} 
              alt="HabitSeed" 
              className="w-28 h-28 mb-6"
            />
            
            <motion.h1 
              className="text-3xl font-bold text-primary mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              HabitSeed
            </motion.h1>
            
            <motion.p
              className="text-muted-foreground text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              Grow your habits, one day at a time
            </motion.p>
            
            <motion.div 
              className="mt-8 h-1 w-24 bg-primary/20 rounded-full overflow-hidden"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ 
                delay: 0.6, 
                duration: 1.2,
                ease: "easeInOut"
              }}
            >
              <motion.div 
                className="h-full bg-primary rounded-full"
                initial={{ x: "-100%" }}
                animate={{ x: "0%" }}
                transition={{ 
                  delay: 0.6,
                  duration: 1.2,
                  ease: "easeInOut"
                }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen; 