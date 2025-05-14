import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn, getGrowthStageEmoji, isMilestoneStreak } from "@/lib/utils";
import { Check, Clock, Star, Plus, Minus, Package, CalendarX, StickyNote } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { TrackingType, CompletionValue } from "@/hooks/useHabits";

interface HabitButtonProps {
  id: string;
  name: string;
  emoji: string;
  streak: number;
  completed: boolean;
  skipped?: boolean;
  onToggle: (id: string) => void;
  onUpdateValue?: (id: string, value: CompletionValue) => void;
  onSkip?: (id: string) => void;
  onUnskip?: (id: string) => void;
  showStreakBadge?: boolean;
  trackingType?: TrackingType;
  targetValue?: number;
  unit?: string;
  completionValue?: CompletionValue;
  notes?: string;
}

const HabitButton = ({
  id,
  name,
  emoji,
  streak,
  completed,
  skipped,
  onToggle,
  onUpdateValue,
  onSkip,
  onUnskip,
  showStreakBadge = true,
  trackingType = "checkbox",
  targetValue = 1,
  unit = "",
  completionValue = false,
  notes = "",
}: HabitButtonProps) => {
  const [showMilestone, setShowMilestone] = useState(false);
  const [prevStreak, setPrevStreak] = useState(streak);
  const [isAnimating, setIsAnimating] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const [value, setValue] = useState<number>(completed && typeof completionValue === 'number' ? completionValue : targetValue);
  const [showNotes, setShowNotes] = useState(false);
  
  // Show milestone animation when streak reaches a milestone
  useEffect(() => {
    if (streak > prevStreak && isMilestoneStreak(streak)) {
      setShowMilestone(true);
      const timer = setTimeout(() => setShowMilestone(false), 3000);
      return () => clearTimeout(timer);
    }
    setPrevStreak(streak);
  }, [streak, prevStreak]);

  // Reset justCompleted flag after animation completes
  useEffect(() => {
    if (justCompleted) {
      const timer = setTimeout(() => setJustCompleted(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [justCompleted]);
  
  // Update value when completionValue changes externally
  useEffect(() => {
    if (typeof completionValue === 'number') {
      setValue(completionValue);
    }
  }, [completionValue]);

  // Get the appropriate growth emoji based on streak
  const displayEmoji = emoji === "🌱" ? getGrowthStageEmoji(streak, emoji) : emoji;

  // Handle click with animation for checkbox habit
  const handleToggle = () => {
    if (trackingType === "checkbox") {
    if (!completed) {
        setIsAnimating(true);
        setJustCompleted(true);
        setTimeout(() => {
          setIsAnimating(false);
        }, 500);
      }
      onToggle(id);
    }
  };

  // Handle value change for non-checkbox habits
  const handleValueChange = (newValue: number) => {
    setValue(newValue);
    if (onUpdateValue) {
      onUpdateValue(id, newValue);
    }
  };

  // Handle submission of value for non-checkbox habits
  const handleSubmitValue = () => {
    if (onUpdateValue && !completed) {
      setIsAnimating(true);
      setJustCompleted(true);
      setTimeout(() => {
        setIsAnimating(false);
      }, 500);
      onUpdateValue(id, value);
    }
  };
  
  // Handle skipping a habit
  const handleSkip = () => {
    if (onSkip && !skipped) {
      onSkip(id);
    }
  };
  
  // Handle unskipping a habit
  const handleUnskip = () => {
    if (onUnskip && skipped) {
      onUnskip(id);
    }
  };

  // Calculate progress percentage for quantity and duration
  const getProgressPercentage = (): number => {
    if (!completed || typeof completionValue !== 'number') return 0;
    const percentage = Math.min((completionValue / targetValue) * 100, 100);
    return percentage;
  };

  // Get the completion display text based on type and value
  const getCompletionText = (): string => {
    if (!completed) return "";
    if (trackingType === "checkbox") return "Completed";
    
    if (typeof completionValue === 'number') {
      if (trackingType === "quantity") {
        return `${completionValue} ${unit}`;
      }
      if (trackingType === "duration") {
        return `${completionValue} ${unit}`;
      }
      if (trackingType === "rating") {
        return `${completionValue}/10`;
      }
    }
    return "";
  };

  return (
    <motion.div
      className={cn(
        "habit-button group",
        completed && "habit-completed",
        skipped && "habit-skipped",
        isAnimating && "animate-pulse-light",
        justCompleted && "animate-celebrate"
      )}
      whileTap={trackingType === "checkbox" ? { scale: 0.97 } : {}}
      layout
    >
      <div className="flex items-center w-full">
        <div 
          className={cn(
            "emoji-container relative mr-4",
            trackingType === "checkbox" && !skipped ? "cursor-pointer" : ""
          )}
          onClick={!skipped && trackingType === "checkbox" ? handleToggle : undefined}
        >
        <motion.div
          key={displayEmoji}
          initial={{ scale: streak > prevStreak ? 0.5 : 1 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 15 }}
            className={cn(skipped && "opacity-50")}
        >
          {displayEmoji}
        </motion.div>
        
          {completed && trackingType === "checkbox" && !skipped && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 500,
                damping: 15,
                duration: 0.3 
              }}
            className="absolute inset-0 flex items-center justify-center"
          >
              <Check 
                className={cn(
                  "text-primary h-8 w-8 stroke-[3]",
                  justCompleted && "animate-scale-check"
                )} 
              />
          </motion.div>
        )}
        
          {skipped && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 500,
                damping: 15,
                duration: 0.3 
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <CalendarX 
                className="text-muted-foreground h-8 w-8 stroke-[2] opacity-80" 
              />
            </motion.div>
          )}
        </div>
        
        <div className="flex flex-col flex-1 items-start">
          <div className="flex items-center justify-between w-full">
            <span className={cn(
              "text-base font-medium text-left truncate max-w-[70%] leading-tight",
              skipped && "text-muted-foreground"
            )}>
              {name}
            </span>
            
            {streak > 0 && showStreakBadge && (
              <motion.span
                className="streak-badge-inline"
                initial={streak > prevStreak ? { scale: 1.5 } : { scale: 1 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
              >
                {streak}
              </motion.span>
            )}
          </div>
          
          {/* Skipped state */}
          {skipped ? (
            <div className="w-full mt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Skipped for today</span>
                
                {onUnskip && (
                  <button
                    onClick={handleUnskip}
                    className="text-xs text-primary hover:text-primary/80 font-medium"
                  >
                    Unskip
                  </button>
                )}
              </div>
            </div>
          ) : (
            // Regular tracking UI
            <>
              {/* Tracking type specific UI */}
              {trackingType === "checkbox" ? (
                // Checkbox type - just show streak count
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs text-muted-foreground mt-1">
                    {completed ? "Completed today" : streak > 0 ? `${streak} day streak` : "Not started yet"}
                  </span>
                  
                  {/* Skip button */}
                  {!completed && onSkip && (
                    <button
                      onClick={handleSkip}
                      className="text-xs text-muted-foreground hover:text-secondary-foreground ml-auto"
                      title="Skip for today"
                    >
                      Skip
                    </button>
                  )}
                </div>
              ) : (
                // Non-checkbox types - show input controls or completion value
                <div className="w-full mt-2">
                  {!completed ? (
                    // Show input controls for uncompleted habits
                    <div className="space-y-2 w-full">
                      {trackingType === "quantity" && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleValueChange(Math.max(1, value - 1))}
                            className="bg-muted hover:bg-muted/80 rounded-md p-1"
                            aria-label="Decrease value"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          
                          <Input
                            type="number"
                            min="0"
                            max="1000"
                            value={value}
                            onChange={(e) => handleValueChange(parseInt(e.target.value) || 0)}
                            className="h-8 w-20 text-center"
                          />
                          
                          <button
                            onClick={() => handleValueChange(value + 1)}
                            className="bg-muted hover:bg-muted/80 rounded-md p-1"
                            aria-label="Increase value"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                          
                          <span className="text-xs">{unit}</span>
                          
                          <div className="ml-auto flex items-center gap-2">
                            {onSkip && (
                              <button
                                onClick={handleSkip}
                                className="text-xs text-muted-foreground hover:text-secondary-foreground"
                                title="Skip for today"
                              >
                                Skip
                              </button>
                            )}
                            
                            <button
                              onClick={handleSubmitValue}
                              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-2 py-1 text-xs"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {trackingType === "duration" && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleValueChange(Math.max(1, value - 5))}
                            className="bg-muted hover:bg-muted/80 rounded-md p-1"
                            aria-label="Decrease value"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          
                          <Input
                            type="number"
                            min="0"
                            max="240"
                            value={value}
                            onChange={(e) => handleValueChange(parseInt(e.target.value) || 0)}
                            className="h-8 w-20 text-center"
                          />
                          
                          <button
                            onClick={() => handleValueChange(value + 5)}
                            className="bg-muted hover:bg-muted/80 rounded-md p-1"
                            aria-label="Increase value"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                          
                          <span className="text-xs">{unit}</span>
                          
                          <div className="ml-auto flex items-center gap-2">
                            {onSkip && (
                              <button
                                onClick={handleSkip}
                                className="text-xs text-muted-foreground hover:text-secondary-foreground"
                                title="Skip for today"
                              >
                                Skip
                              </button>
                            )}
                            
                            <button
                              onClick={handleSubmitValue}
                              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-2 py-1 text-xs"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {trackingType === "rating" && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Rating: {value}/10</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Slider
                              min={1}
                              max={10}
                              step={1}
                              value={[value]}
                              onValueChange={(v) => handleValueChange(v[0])}
                            />
                            
                            <div className="ml-auto flex items-center gap-2">
                              {onSkip && (
                                <button
                                  onClick={handleSkip}
                                  className="text-xs text-muted-foreground hover:text-secondary-foreground"
                                  title="Skip for today"
                                >
                                  Skip
                                </button>
                              )}
                              
                              <button
                                onClick={handleSubmitValue}
                                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-2 py-1 text-xs"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Show completion status for completed habits
                    <div className="space-y-1 w-full">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          {trackingType === "quantity" && <Package className="h-3 w-3" />}
                          {trackingType === "duration" && <Clock className="h-3 w-3" />}
                          {trackingType === "rating" && <Star className="h-3 w-3" />}
                          {getCompletionText()}
                        </span>
                        
                        <button
                          onClick={() => onToggle(id)}
                          className="text-xs text-muted-foreground hover:text-primary"
                        >
                          Undo
                        </button>
                      </div>
                      
                      {(trackingType === "quantity" || trackingType === "duration") && (
                        <Progress value={getProgressPercentage()} className="h-2" />
                      )}
                      
                      {trackingType === "rating" && typeof completionValue === 'number' && (
                        <div className="flex mt-1">
                          {Array.from({ length: 10 }).map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "h-3 w-3",
                                i < completionValue ? "fill-primary text-primary" : "text-muted"
                              )}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
          
          {/* Notes section */}
          {notes && (
            <div className="w-full mt-2">
              <button
                onClick={() => setShowNotes(!showNotes)}
                className="flex items-center text-xs text-muted-foreground hover:text-foreground/90 font-medium"
              >
                <StickyNote className="h-3 w-3 mr-1" />
                {showNotes ? "Hide notes" : "Show notes"}
              </button>
              
              {showNotes && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="w-full mt-2 text-xs bg-muted/50 p-2 rounded-md"
                >
                  {notes}
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <AnimatePresence>
        {showMilestone && (
          <motion.div
            initial={{ scale: 0, opacity: 0, y: -10 }}
            animate={{ scale: 1, opacity: 1, y: -35 }}
            exit={{ scale: 0, opacity: 0, y: -45 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
            className="absolute top-0 left-1/2 -translate-x-1/2 z-10"
          >
            <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm whitespace-nowrap font-medium shadow-lg">
              🎉 {streak} day streak!
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default HabitButton;
