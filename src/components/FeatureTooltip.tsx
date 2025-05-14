import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FeatureTooltipProps {
  id: string;
  title: string;
  description: string;
  position?: "top" | "bottom" | "left" | "right";
  children: React.ReactNode;
  onDismiss?: () => void;
}

/**
 * FeatureTooltip component shows a tooltip for new features.
 * The tooltip will be shown once for each feature ID and then remembered.
 */
const FeatureTooltip: React.FC<FeatureTooltipProps> = ({
  id,
  title,
  description,
  position = "bottom",
  children,
  onDismiss
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const storageKey = `feature_tooltip_${id}`;

  // Check if this tooltip has been shown before
  useEffect(() => {
    const hasSeenFeature = localStorage.getItem(storageKey);
    if (!hasSeenFeature) {
      // Delay showing the tooltip slightly to avoid jarring experience
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [id, storageKey]);

  const handleDismiss = () => {
    setIsVisible(false);
    // Remember that this tooltip has been shown
    localStorage.setItem(storageKey, "seen");
    if (onDismiss) {
      onDismiss();
    }
  };

  // Position the tooltip based on the specified position
  const getPositionStyles = () => {
    switch (position) {
      case "top":
        return "bottom-full mb-2 left-1/2 transform -translate-x-1/2";
      case "bottom":
        return "top-full mt-2 left-1/2 transform -translate-x-1/2";
      case "left":
        return "right-full mr-2 top-1/2 transform -translate-y-1/2";
      case "right":
        return "left-full ml-2 top-1/2 transform -translate-y-1/2";
      default:
        return "top-full mt-2 left-1/2 transform -translate-x-1/2";
    }
  };

  // Tooltip animation variants
  const tooltipVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 }
  };

  return (
    <div className="relative inline-flex">
      {children}
      
      <AnimatePresence>
        {isVisible && (
          <motion.div 
            className={`absolute z-50 ${getPositionStyles()}`}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={tooltipVariants}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-primary/95 text-primary-foreground shadow-lg rounded-lg p-3 max-w-[250px]">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5">
                  <Lightbulb className="h-4 w-4 text-primary-foreground/80" />
                  <h4 className="font-semibold text-sm">{title}</h4>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-5 w-5 rounded-full p-0 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/20"
                  onClick={handleDismiss}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-xs text-primary-foreground/90">{description}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FeatureTooltip; 