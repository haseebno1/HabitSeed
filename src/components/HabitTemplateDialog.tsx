import { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusSquare } from "lucide-react";
import { HabitTemplateSelector } from "./HabitTemplateSelector";
import { HabitTemplate } from "@/lib/habitTemplates";

interface HabitTemplateDialogProps {
  onSelectTemplate: (template: HabitTemplate) => void;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function HabitTemplateDialog({ 
  onSelectTemplate, 
  trigger,
  open,
  onOpenChange
}: HabitTemplateDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  
  // Determine whether to use external or internal open state
  const isOpen = open !== undefined ? open : internalOpen;
  
  // Determine which handler to use for open changes
  const handleOpenChange = onOpenChange || setInternalOpen;

  const handleSelectTemplate = (template: HabitTemplate) => {
    onSelectTemplate(template);
    handleOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Choose a Habit Template</DialogTitle>
          <DialogDescription>
            Select a template to quickly add common habits to your routine
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <HabitTemplateSelector 
            onSelectTemplate={handleSelectTemplate} 
            onClose={() => handleOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
} 