import { useState } from "react";
import { Bell, BellOff, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/hooks/useNotifications";
import { Skeleton } from "@/components/ui/skeleton";

export function NotificationSettings() {
  const { toast } = useToast();
  const {
    isSupported,
    isEnabled,
    isLoading,
    reminderTime,
    requestPermission,
    setDailyReminder,
  } = useNotifications();
  
  const [time, setTime] = useState(reminderTime);
  const [isSaving, setIsSaving] = useState(false);

  // Handle enabling notifications
  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    
    if (granted) {
      toast({
        title: "Notifications Enabled",
        description: "You'll receive daily reminders for your habits",
      });
      
      // Set the daily reminder with current time
      await setDailyReminder(time);
    } else {
      toast({
        title: "Permission Denied",
        description: "Please enable notifications in your device settings",
        variant: "destructive",
      });
    }
  };

  // Handle time change
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTime(e.target.value);
  };

  // Save reminder time
  const saveReminderTime = async () => {
    if (!isEnabled) return;
    
    setIsSaving(true);
    
    try {
      const success = await setDailyReminder(time);
      
      if (success) {
        toast({
          title: "Reminder Updated",
          description: `Daily reminder set for ${time}`,
        });
      } else {
        toast({
          title: "Update Failed",
          description: "Could not set the reminder time",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving reminder time:", error);
      toast({
        title: "Error",
        description: "Could not save reminder settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/3 mb-2" />
          <Skeleton className="h-4 w-2/3" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Notifications Not Supported
          </CardTitle>
          <CardDescription>
            Your browser or device doesn't support notifications.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Daily Reminders
        </CardTitle>
        <CardDescription>
          Get reminded to check in with your habits every day.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <Label htmlFor="notifications">Enable notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive daily habit reminders
            </p>
          </div>
          <Switch
            id="notifications"
            checked={isEnabled}
            onCheckedChange={() => {
              if (!isEnabled) {
                handleEnableNotifications();
              } else {
                toast({
                  title: "Notice",
                  description: "To disable notifications, use your device settings",
                });
              }
            }}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reminderTime" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Reminder Time
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="reminderTime"
              type="time"
              value={time}
              onChange={handleTimeChange}
              disabled={!isEnabled}
              className="w-32"
            />
            <Button 
              onClick={saveReminderTime} 
              disabled={!isEnabled || isSaving || time === reminderTime}
              size="sm"
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {isEnabled
              ? `You'll be reminded daily at ${time}`
              : "Enable notifications to set a daily reminder"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 