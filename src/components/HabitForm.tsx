import React, { useState, useEffect } from "react";
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { TrackingType, FrequencyType } from "@/hooks/useHabits";
import { Trash, Check, Ruler, Clock, Star, Calendar as CalendarIcon, Repeat, StickyNote, PlusSquare } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import EmojiPicker from "./EmojiPicker";
import { HabitTemplateDialog } from "./HabitTemplateDialog";
import { HabitTemplate } from "@/lib/habitTemplates";

const EMOJI_OPTIONS = ["🌱", "🏃", "💧", "📚", "🧘", "🍎", "😊", "💪", "🧠", "💤"];

// Predefined units for quantity and duration
const QUANTITY_UNITS = ["pages", "glasses", "steps", "reps", "items", "cups", "servings", "units"];
const DURATION_UNITS = ["minutes", "hours"];

// Days of the week for weekly frequency
const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

interface HabitFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habit: { 
    name: string; 
    emoji: string; 
    id?: string;
    trackingType: TrackingType;
    targetValue?: number;
    unit?: string;
    frequency: FrequencyType;
    frequencyData?: {
      daysOfWeek?: number[];
      daysOfMonth?: number[];
      interval?: number;
      startDate?: string;
    };
    notes?: string;
  }) => void;
  onDelete?: () => void;
  initialValues?: { 
    id: string; 
    name: string; 
    emoji: string;
    trackingType?: TrackingType;
    targetValue?: number;
    unit?: string;
    frequency?: FrequencyType;
    frequencyData?: {
      daysOfWeek?: number[];
      daysOfMonth?: number[];
      interval?: number;
      startDate?: string;
    };
    notes?: string;
  };
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
  const [trackingType, setTrackingType] = useState<TrackingType>(initialValues?.trackingType || "checkbox");
  const [targetValue, setTargetValue] = useState<number>(initialValues?.targetValue || 1);
  const [unit, setUnit] = useState<string>(initialValues?.unit || "");
  const [customUnit, setCustomUnit] = useState<string>("");
  const [notes, setNotes] = useState<string>(initialValues?.notes || "");
  
  // Frequency settings
  const [frequency, setFrequency] = useState<FrequencyType>(initialValues?.frequency || "daily");
  const [selectedDaysOfWeek, setSelectedDaysOfWeek] = useState<number[]>(
    initialValues?.frequencyData?.daysOfWeek || [1, 2, 3, 4, 5] // Monday-Friday by default
  );
  const [selectedDaysOfMonth, setSelectedDaysOfMonth] = useState<number[]>(
    initialValues?.frequencyData?.daysOfMonth || [1] // 1st of month by default
  );
  const [customInterval, setCustomInterval] = useState<number>(
    initialValues?.frequencyData?.interval || 2 // Every 2 days by default
  );
  const [startDate, setStartDate] = useState<Date | undefined>(
    initialValues?.frequencyData?.startDate 
      ? new Date(initialValues.frequencyData.startDate) 
      : new Date()
  );

  // Reset form values when initialValues changes or when the form opens/closes
  useEffect(() => {
    if (initialValues) {
      setName(initialValues.name);
      setEmoji(initialValues.emoji);
      setTrackingType(initialValues.trackingType || "checkbox");
      setTargetValue(initialValues.targetValue || 1);
      setUnit(initialValues.unit || "");
      setFrequency(initialValues.frequency || "daily");
      setNotes(initialValues.notes || "");
      
      // Handle frequency data
      if (initialValues.frequencyData) {
        setSelectedDaysOfWeek(initialValues.frequencyData.daysOfWeek || [1, 2, 3, 4, 5]);
        setSelectedDaysOfMonth(initialValues.frequencyData.daysOfMonth || [1]);
        setCustomInterval(initialValues.frequencyData.interval || 2);
        
        if (initialValues.frequencyData.startDate) {
          setStartDate(new Date(initialValues.frequencyData.startDate));
        }
      }
      
      // Handle custom unit
      if (initialValues.unit && 
          !QUANTITY_UNITS.includes(initialValues.unit) && 
          !DURATION_UNITS.includes(initialValues.unit)) {
        setCustomUnit(initialValues.unit);
      } else {
        setCustomUnit("");
      }
    } else if (!isOpen) {
      // Reset form when closing without initialValues
      setName("");
      setEmoji("🌱");
      setTrackingType("checkbox");
      setTargetValue(1);
      setUnit("");
      setCustomUnit("");
      setFrequency("daily");
      setSelectedDaysOfWeek([1, 2, 3, 4, 5]); // Monday-Friday
      setSelectedDaysOfMonth([1]); // 1st of month
      setCustomInterval(2); // Every 2 days
      setStartDate(new Date());
      setNotes("");
    }
  }, [initialValues, isOpen]);
  
  // Listen for the prefill-habit event
  useEffect(() => {
    const handlePrefillHabit = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && !initialValues) {
        setName(customEvent.detail.name || "");
        setEmoji(customEvent.detail.emoji || "🌱");
        if (customEvent.detail.trackingType) {
          setTrackingType(customEvent.detail.trackingType);
        }
        if (customEvent.detail.targetValue) {
          setTargetValue(customEvent.detail.targetValue);
        }
        if (customEvent.detail.unit) {
          setUnit(customEvent.detail.unit);
        }
        if (customEvent.detail.frequency) {
          setFrequency(customEvent.detail.frequency);
        }
        if (customEvent.detail.notes) {
          setNotes(customEvent.detail.notes);
        }
        if (customEvent.detail.frequencyData) {
          if (customEvent.detail.frequencyData.daysOfWeek) {
            setSelectedDaysOfWeek(customEvent.detail.frequencyData.daysOfWeek);
          }
          if (customEvent.detail.frequencyData.daysOfMonth) {
            setSelectedDaysOfMonth(customEvent.detail.frequencyData.daysOfMonth);
          }
          if (customEvent.detail.frequencyData.interval) {
            setCustomInterval(customEvent.detail.frequencyData.interval);
          }
          if (customEvent.detail.frequencyData.startDate) {
            setStartDate(new Date(customEvent.detail.frequencyData.startDate));
          }
        }
      }
    };
    
    window.addEventListener('prefill-habit', handlePrefillHabit);
    
    return () => {
      window.removeEventListener('prefill-habit', handlePrefillHabit);
    };
  }, [initialValues]);

  // Handle unit selection or custom unit input
  const handleUnitChange = (value: string) => {
    if (value === "custom") {
      setUnit("");
    } else {
      setUnit(value);
      setCustomUnit("");
    }
  };

  // Handle custom unit input change
  const handleCustomUnitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomUnit(e.target.value);
    setUnit(e.target.value);
  };
  
  // Handle day of week toggle for weekly habits
  const toggleDayOfWeek = (day: number) => {
    setSelectedDaysOfWeek(prevDays => {
      if (prevDays.includes(day)) {
        return prevDays.filter(d => d !== day);
      } else {
        return [...prevDays, day].sort();
      }
    });
  };
  
  // Handle day of month toggle for monthly habits
  const toggleDayOfMonth = (day: number) => {
    setSelectedDaysOfMonth(prevDays => {
      if (prevDays.includes(day)) {
        return prevDays.filter(d => d !== day);
      } else {
        return [...prevDays, day].sort((a, b) => a - b);
      }
    });
  };
  
  // Helper to generate array of days in month (1-31)
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  const handleSave = () => {
    if (!name.trim()) return;
    
    // Prepare frequency data based on selected frequency type
    const frequencyData = {
      ...(frequency === "weekly" && { daysOfWeek: selectedDaysOfWeek }),
      ...(frequency === "monthly" && { daysOfMonth: selectedDaysOfMonth }),
      ...(frequency === "custom" && { 
        interval: customInterval,
        startDate: startDate ? startDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      }),
    };
    
    const habitData = {
      id: initialValues?.id,
      name: name.trim().slice(0, 25),
      emoji,
      trackingType,
      frequency,
      ...(Object.keys(frequencyData).length > 0 && { frequencyData }),
      ...(trackingType !== "checkbox" && { targetValue }),
      ...(["quantity", "duration"].includes(trackingType) && unit && { unit }),
      ...(notes.trim() !== "" && { notes: notes.trim() }),
    };
    
    onSave(habitData);
  };

  // Get icon based on tracking type
  const getTrackingTypeIcon = (type: TrackingType) => {
    switch (type) {
      case "checkbox":
        return <Check className="h-4 w-4" />;
      case "quantity":
        return <Ruler className="h-4 w-4" />;
      case "duration":
        return <Clock className="h-4 w-4" />;
      case "rating":
        return <Star className="h-4 w-4" />;
      default:
        return <Check className="h-4 w-4" />;
    }
  };

  const handleTemplateSelect = (template: HabitTemplate) => {
    setName(template.name);
    setEmoji(template.emoji);
    setTrackingType(template.trackingType);
    setTargetValue(template.targetValue || 1);
    setUnit(template.unit || "");
    setFrequency(template.frequency);
    setNotes(template.description || "");
    
    // Set frequency data
    if (template.frequencyData) {
      if (template.frequency === "weekly" && template.frequencyData.daysOfWeek) {
        setSelectedDaysOfWeek(template.frequencyData.daysOfWeek);
      } 
      else if (template.frequency === "monthly" && template.frequencyData.daysOfMonth) {
        setSelectedDaysOfMonth(template.frequencyData.daysOfMonth);
      }
      else if (template.frequency === "custom") {
        if (template.frequencyData.interval) {
          setCustomInterval(template.frequencyData.interval);
        }
        if (template.frequencyData.startDate) {
          setStartDate(new Date(template.frequencyData.startDate));
        }
      }
    }
    
    // Handle custom unit
    if (template.unit && 
        !QUANTITY_UNITS.includes(template.unit) && 
        !DURATION_UNITS.includes(template.unit)) {
      setCustomUnit(template.unit);
    } else {
      setCustomUnit("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
          <DialogTitle>
            {initialValues ? "Edit Habit" : "Add New Habit"}
          </DialogTitle>
            {!initialValues && (
              <HabitTemplateDialog 
                onSelectTemplate={handleTemplateSelect}
                trigger={
                  <Button variant="ghost" size="sm" className="flex items-center gap-1 text-xs">
                    <PlusSquare className="h-3.5 w-3.5" />
                    Templates
                  </Button>
                }
              />
            )}
          </div>
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
            <div className="flex items-center gap-3">
              <div className="p-4 bg-muted rounded-md flex items-center justify-center text-3xl border">
                {emoji}
              </div>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex-1 justify-start text-left">
                    <span className="mr-2">Change Emoji</span>
                    {!EMOJI_OPTIONS.includes(emoji) && (
                      <span className="text-xs text-muted-foreground ml-auto">
                        Custom Emoji
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="start">
                  <EmojiPicker onEmojiSelect={setEmoji} />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="mt-1">
              <p className="text-xs text-muted-foreground">
                Common emojis:
              </p>
              <div className="grid grid-cols-5 gap-2 mt-1">
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
          
          <div className="grid gap-2">
            <Label>Frequency</Label>
            <Tabs 
              defaultValue={frequency} 
              onValueChange={(v) => setFrequency(v as FrequencyType)}
              value={frequency}
              className="w-full"
            >
              <TabsList className="grid grid-cols-4 mb-2">
                <TabsTrigger value="daily" title="Every day">
                  <Check className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Daily</span>
                </TabsTrigger>
                <TabsTrigger value="weekly" title="Select days of the week">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Weekly</span>
                </TabsTrigger>
                <TabsTrigger value="monthly" title="Select days of the month">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Monthly</span>
                </TabsTrigger>
                <TabsTrigger value="custom" title="Custom interval">
                  <Repeat className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Custom</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="daily" className="pt-2">
                <p className="text-sm text-muted-foreground">
                  This habit will be tracked every day.
                </p>
              </TabsContent>
              
              <TabsContent value="weekly" className="pt-2 space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">Select days of the week</Label>
                  <div className="grid grid-cols-7 gap-1">
                    {DAYS_OF_WEEK.map((day) => (
                      <div key={day.value} className="flex flex-col items-center">
                        <button
                          type="button"
                          onClick={() => toggleDayOfWeek(day.value)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-medium 
                          ${selectedDaysOfWeek.includes(day.value) 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                          aria-label={`Select ${day.label}`}
                        >
                          {day.label.slice(0, 1)}
                        </button>
                        <span className="text-xs mt-1 text-muted-foreground">
                          {day.label.slice(0, 3)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                {selectedDaysOfWeek.length === 0 && (
                  <p className="text-xs text-destructive">
                    Please select at least one day
                  </p>
                )}
              </TabsContent>
              
              <TabsContent value="monthly" className="pt-2 space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">Select days of the month</Label>
                  <div className="flex flex-wrap gap-1">
                    {daysInMonth.map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDayOfMonth(day)}
                        className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-medium 
                        ${selectedDaysOfMonth.includes(day) 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                        aria-label={`Select day ${day}`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
                {selectedDaysOfMonth.length === 0 && (
                  <p className="text-xs text-destructive">
                    Please select at least one day
                  </p>
                )}
              </TabsContent>
              
              <TabsContent value="custom" className="pt-2 space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">Repeat every</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      max="365"
                      value={customInterval}
                      onChange={(e) => setCustomInterval(parseInt(e.target.value) || 1)}
                      className="w-20"
                    />
                    <span className="text-sm">days</span>
                  </div>
                  
                  <div className="space-y-1 mt-4">
                    <Label className="text-sm">Starting from</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, 'PPP') : 'Select a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={(date) => setStartDate(date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="grid gap-2">
            <Label>Tracking Type</Label>
            <Tabs 
              defaultValue={trackingType} 
              onValueChange={(v) => setTrackingType(v as TrackingType)}
              value={trackingType}
              className="w-full"
            >
              <TabsList className="grid grid-cols-4 mb-2">
                <TabsTrigger value="checkbox" title="Simple yes/no completion">
                  <Check className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Checkbox</span>
                </TabsTrigger>
                <TabsTrigger value="quantity" title="Track a quantity with a target">
                  <Ruler className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Quantity</span>
                </TabsTrigger>
                <TabsTrigger value="duration" title="Track time spent">
                  <Clock className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Duration</span>
                </TabsTrigger>
                <TabsTrigger value="rating" title="Rate on a scale">
                  <Star className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Rating</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="checkbox" className="pt-2">
                <p className="text-sm text-muted-foreground">
                  Simple yes/no tracking - just mark the habit as complete each day.
                </p>
              </TabsContent>
              
              <TabsContent value="quantity" className="pt-2 space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">Target quantity</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      max="1000"
                      value={targetValue}
                      onChange={(e) => setTargetValue(parseInt(e.target.value) || 1)}
                      className="w-20"
                    />
                    
                    <Select 
                      value={QUANTITY_UNITS.includes(unit) ? unit : (unit ? "custom" : "")} 
                      onValueChange={handleUnitChange}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {QUANTITY_UNITS.map(u => (
                          <SelectItem key={u} value={u}>{u}</SelectItem>
                        ))}
                        <SelectItem value="custom">Custom unit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Custom unit input */}
                  {!QUANTITY_UNITS.includes(unit) && (
                    <Input
                      placeholder="Enter custom unit"
                      value={customUnit}
                      onChange={handleCustomUnitChange}
                      className="mt-2"
                    />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Example: Read {targetValue} {unit || "pages"} per day
                </p>
              </TabsContent>
              
              <TabsContent value="duration" className="pt-2 space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">Target duration</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      max="240"
                      value={targetValue}
                      onChange={(e) => setTargetValue(parseInt(e.target.value) || 1)}
                      className="w-20"
                    />
                    
                    <Select 
                      value={DURATION_UNITS.includes(unit) ? unit : "minutes"}
                      onValueChange={setUnit}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {DURATION_UNITS.map(u => (
                          <SelectItem key={u} value={u}>{u}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Example: Meditate for {targetValue} {unit || "minutes"} per day
                </p>
              </TabsContent>
              
              <TabsContent value="rating" className="pt-2 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Rating scale (1-10)</Label>
                    <span className="text-sm font-medium">{targetValue}</span>
                  </div>
                  <Slider
                    min={1}
                    max={10}
                    step={1}
                    value={[targetValue]}
                    onValueChange={(value) => setTargetValue(value[0])}
                    className="py-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Example: Rate your mood each day from 1-10
                </p>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="habit-notes" className="flex items-center gap-2">
              <StickyNote className="h-4 w-4" />
              Notes & Reflections
            </Label>
            <Textarea
              id="habit-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes, reflections, or reminders about this habit..."
              className="min-h-[80px] resize-y"
              maxLength={500}
            />
            {notes.length >= 400 && (
              <div className="text-xs text-muted-foreground text-right">
                {notes.length}/500
              </div>
            )}
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
