
import React from "react";
import { Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import FeatureTooltip from "./FeatureTooltip";

interface AddHabitButtonProps {
  onClick: () => void;
  onTemplateClick: () => void;
}

const AddHabitButton: React.FC<AddHabitButtonProps> = ({ onClick, onTemplateClick }) => {
  return (
    <Popover>
      <FeatureTooltip 
        id="add-habit-options"
        title="New Feature!"
        description="You can now create custom habits or choose from templates for quick setup."
        position="top"
      >
        <PopoverTrigger asChild>
          <Button
            className="w-full flex items-center justify-center gap-2 py-6"
            variant="outline"
          >
            <Plus className="h-5 w-5" />
            <span>Add Habit</span>
          </Button>
        </PopoverTrigger>
      </FeatureTooltip>
      
      <PopoverContent className="w-60 p-0" align="center">
        <div className="grid grid-cols-1 divide-y">
          <Button
            variant="ghost"
            className="flex items-center justify-start gap-2 py-6 rounded-none rounded-t-md px-4"
            onClick={onClick}
          >
            <Plus className="h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">Custom Habit</div>
              <div className="text-xs text-muted-foreground">Create your own habit</div>
            </div>
          </Button>
          
          <Button
            variant="ghost"
            className="flex items-center justify-start gap-2 py-6 rounded-none rounded-b-md px-4"
            onClick={onTemplateClick}
          >
            <Sparkles className="h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">Use Template</div>
              <div className="text-xs text-muted-foreground">Choose from preset habits</div>
            </div>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default AddHabitButton;
