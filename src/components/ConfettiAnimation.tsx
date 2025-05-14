import React, { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";

// Confetti particle types
type ConfettiParticle = {
  key: number;
  x: number;
  y: number;
  rotationStart: number;
  rotationEnd: number;
  color: string;
  size: number;
  delay: number;
};

interface ConfettiAnimationProps {
  show: boolean;
  duration?: number;
  count?: number;
}

// Colors for the confetti pieces
const COLORS = [
  "#22c55e", // Green
  "#0ea5e9", // Blue
  "#f59e0b", // Yellow
  "#ef4444", // Red
  "#a855f7", // Purple
  "#ec4899", // Pink
];

// Particle shapes
const SHAPES = ["square", "circle"];

const ConfettiAnimation: React.FC<ConfettiAnimationProps> = ({ 
  show, 
  duration = 2000, 
  count = 75 
}) => {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);
  
  // Generate confetti particles
  const generateParticles = useCallback(() => {
    const newParticles: ConfettiParticle[] = [];
    
    for (let i = 0; i < count; i++) {
      newParticles.push({
        key: i,
        // Position particles in a cone shape from the button
        x: Math.random() * 100 - 50, // -50% to 50% of container
        y: Math.random() * -80 - 20, // -20% to -100% above
        rotationStart: Math.random() * 180 - 90,
        rotationEnd: Math.random() * 360 - 180,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: Math.random() * 8 + 4, // 4px to 12px
        delay: Math.random() * 0.2, // 0s to 0.2s delay
      });
    }
    
    setParticles(newParticles);
  }, [count]);
  
  // Trigger confetti animation
  useEffect(() => {
    if (show) {
      generateParticles();
      
      // Clear particles after animation completes
      const timer = setTimeout(() => {
        setParticles([]);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [show, duration, generateParticles]);
  
  if (particles.length === 0) return null;
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map(particle => {
        const isSquare = SHAPES[Math.floor(Math.random() * SHAPES.length)] === "square";
        
        return (
          <motion.div
            key={particle.key}
            initial={{ 
              top: "50%",
              left: "50%",
              x: 0,
              y: 0,
              scale: 0,
              rotate: particle.rotationStart,
              opacity: 1,
            }}
            animate={{ 
              x: `${particle.x}%`, 
              y: `${particle.y}%`,
              scale: 1,
              rotate: particle.rotationEnd,
              opacity: 0,
            }}
            transition={{ 
              type: "spring",
              stiffness: 50,
              damping: 20,
              duration: duration / 1000,
              delay: particle.delay,
            }}
            style={{ 
              position: "absolute",
              width: particle.size,
              height: particle.size,
              background: particle.color,
              borderRadius: isSquare ? "2px" : "50%",
            }}
          />
        );
      })}
    </div>
  );
};

export default ConfettiAnimation; 