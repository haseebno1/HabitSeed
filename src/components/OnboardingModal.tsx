import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, Check, Star, Zap, Calendar, BarChart2, Bell, Smile } from "lucide-react";

interface OnboardingModalProps {
  onComplete: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Check if user has seen onboarding
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
    if (!hasSeenOnboarding) {
      // Wait a moment before showing the modal
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  // Update current step and handle completion
  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsOpen(false);
    localStorage.setItem("hasSeenOnboarding", "true");
    onComplete();
  };

  const onboardingSteps = [
    {
      title: "Welcome to HabitSeed",
      description: "Your personal habit tracking companion. Let's get started with a quick overview.",
      icon: <Star className="h-10 w-10 text-primary" />,
      content: (
        <div className="flex flex-col items-center gap-4 py-6">
          <div className="text-5xl">🌱</div>
          <p className="text-center text-muted-foreground">
            HabitSeed helps you build and maintain positive habits with a simple and effective approach.
            Track your progress, build streaks, and visualize your growth over time.
          </p>
        </div>
      )
    },
    {
      title: "Track Your Habits",
      description: "Create flexible habit tracking that works for you.",
      icon: <Check className="h-10 w-10 text-primary" />,
      content: (
        <div className="flex flex-col gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/40 p-3 rounded-lg flex flex-col items-center">
              <Zap className="h-6 w-6 text-primary mb-2" />
              <h4 className="font-medium text-sm">Flexible Tracking</h4>
              <p className="text-xs text-center text-muted-foreground">
                Simple Yes/No, quantities, timers, or ratings
              </p>
            </div>
            <div className="bg-muted/40 p-3 rounded-lg flex flex-col items-center">
              <Calendar className="h-6 w-6 text-primary mb-2" />
              <h4 className="font-medium text-sm">Custom Schedules</h4>
              <p className="text-xs text-center text-muted-foreground">
                Daily, weekly, or custom frequency
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Add habits that matter to you and customize them to fit your lifestyle.
          </p>
        </div>
      )
    },
    {
      title: "Build Consistency",
      description: "Visualize your progress and build lasting streaks.",
      icon: <BarChart2 className="h-10 w-10 text-primary" />,
      content: (
        <div className="flex flex-col gap-4 py-4">
          <div className="flex justify-center">
            <div className="bg-primary/10 rounded-lg p-4 flex items-center justify-center">
              <div className="grid grid-cols-7 gap-1">
                {[...Array(7)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-semibold ${
                      i < 5 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {i < 5 ? <Check className="h-4 w-4" /> : ''}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Track your streaks, view detailed statistics, and see your progress over time to stay motivated.
          </p>
        </div>
      )
    },
    {
      title: "Stay on Track",
      description: "Get reminders and personalize your experience.",
      icon: <Bell className="h-10 w-10 text-primary" />,
      content: (
        <div className="flex flex-col gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/40 p-3 rounded-lg flex flex-col items-center">
              <Bell className="h-6 w-6 text-primary mb-2" />
              <h4 className="font-medium text-sm">Reminders</h4>
              <p className="text-xs text-center text-muted-foreground">
                Set daily notifications to stay consistent
              </p>
            </div>
            <div className="bg-muted/40 p-3 rounded-lg flex flex-col items-center">
              <Smile className="h-6 w-6 text-primary mb-2" />
              <h4 className="font-medium text-sm">Personalization</h4>
              <p className="text-xs text-center text-muted-foreground">
                Themes, icons, and customization options
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Make HabitSeed your own with personalized settings and reminders that work for you.
          </p>
        </div>
      )
    }
  ];

  const currentStepData = onboardingSteps[currentStep];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {currentStepData.icon}
            <div>
              <div>{currentStepData.title}</div>
              <DialogDescription>
                {currentStepData.description}
              </DialogDescription>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-2">
          {currentStepData.content}
        </div>
        
        {/* Step indicator */}
        <div className="flex justify-center gap-1 py-2">
          {onboardingSteps.map((_, index) => (
            <div 
              key={index} 
              className={`h-1.5 rounded-full ${
                index === currentStep 
                  ? 'w-6 bg-primary' 
                  : 'w-1.5 bg-muted'
              }`}
            />
          ))}
        </div>
        
        <DialogFooter className="flex gap-2 sm:justify-between">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className={currentStep === 0 ? 'opacity-0' : ''}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
          
          <Button onClick={handleNext}>
            {currentStep < onboardingSteps.length - 1 ? (
              <>
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </>
            ) : (
              'Get Started'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;