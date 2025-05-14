import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Trash } from "lucide-react";

const EMOJI_OPTIONS = ["🌱", "🏃", "💧", "📚", "🧘", "🍎", "😊", "💪", "🧠", "💤"];

interface HabitFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habit: { name: string; emoji: string; id?: string }) => void;
  onDelete?: () => void;
  initialValues?: { id: string; name: string; emoji: string };
}

const HabitForm = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialValues,
}: HabitFormProps) => {
  const [name, setName] = useState(initialValues?.name || "");
  const [emoji, setEmoji] = useState(initialValues?.emoji || "🌱");

  const handleSave = () => {
    if (!name.trim()) return;
    
    onSave({
      id: initialValues?.id,
      name: name.trim().slice(0, 25),
      emoji,
    });
    
    if (!initialValues) {
      setName("");
      setEmoji("🌱");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialValues ? "Edit Habit" : "Add New Habit"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-3">
          <div className="grid gap-2">
            <Label htmlFor="habit-name">Habit Name</Label>
            <Input
              id="habit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Drink water"
              maxLength={25}
              autoFocus
              className="h-10"
            />
            {name.length >= 20 && (
              <div className="text-xs text-muted-foreground text-right">
                {name.length}/25
              </div>
            )}
          </div>
          
          <div className="grid gap-2">
            <Label>Choose an Emoji</Label>
            <div className="grid grid-cols-5 gap-2">
              {EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  type="button"
                  className={`text-2xl p-2 rounded-md hover:bg-accent ${
                    emoji === e ? "bg-accent ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setEmoji(e)}
                  aria-label={`Select emoji ${e}`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-between">
          {initialValues && onDelete && (
            <Button
              variant="outline"
              onClick={onDelete}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 w-full sm:w-auto order-last sm:order-first"
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
          <div className="flex gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <Button variant="outline" onClick={onClose} className="flex-1 sm:flex-initial">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!name.trim()} className="flex-1 sm:flex-initial">
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default HabitForm;
