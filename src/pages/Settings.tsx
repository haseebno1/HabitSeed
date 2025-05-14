import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useTheme } from "@/components/ThemeProvider";
import { useSettings } from "@/hooks/useSettings";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Slider } from "@/components/ui/slider";
import { Trash, RefreshCw, Download, Upload, Github, ExternalLink, Check, Database, Smartphone, Globe, BellRing } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { useHabits } from "@/hooks/useHabits";
import storage, { isIndexedDBSupported } from "@/lib/storage";
import { isCapacitorApp } from "@/lib/capacitor-storage";
import { Badge } from "@/components/ui/badge";

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { maxHabits, setMaxHabits, showStreakBadges, setShowStreakBadges, clearAllData, isInitialized: settingsInitialized } = useSettings();
  const { habits, exportHabits, importHabits, isInitialized: habitsInitialized } = useHabits();
  const { toast } = useToast();
  
  // For file input reference
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [dbStatus, setDbStatus] = useState<"checking" | "capacitor" | "indexeddb" | "localstorage">("checking");
  const [platform, setPlatform] = useState<"web" | "mobile">("web");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState("20:00");
  
  useEffect(() => {
    // Check platform and storage type
    const isMobile = isCapacitorApp();
    setPlatform(isMobile ? "mobile" : "web");
    
    if (isMobile) {
      setDbStatus("capacitor");
      
      // Check notification permissions on mobile
      const checkNotificationPermissions = async () => {
        try {
          if (window.Capacitor?.isNativePlatform()) {
            const { LocalNotifications } = await import('@capacitor/local-notifications');
            const perms = await LocalNotifications.checkPermissions();
            setNotificationsEnabled(perms.display === 'granted');
          }
        } catch (e) {
          console.error("Error checking notification permissions:", e);
        }
      };
      
      checkNotificationPermissions();
      
      // Load reminder time from preferences
      const loadReminderSettings = async () => {
        try {
          const { Preferences } = await import('@capacitor/preferences');
          const result = await Preferences.get({ key: 'reminderTime' });
          if (result.value) {
            setReminderTime(result.value);
          }
        } catch (e) {
          console.error("Error loading reminder settings:", e);
        }
      };
      
      loadReminderSettings();
    } else if (isIndexedDBSupported()) {
      setDbStatus("indexeddb");
    } else {
      setDbStatus("localstorage");
    }
  }, []);

  const requestNotificationPermission = async () => {
    try {
      if (window.Capacitor?.isNativePlatform()) {
        const { LocalNotifications } = await import('@capacitor/local-notifications');
        const perms = await LocalNotifications.requestPermissions();
        setNotificationsEnabled(perms.display === 'granted');
        
        if (perms.display === 'granted') {
          toast({
            title: "Notifications Enabled",
            description: "You'll now receive reminders for your habits",
            duration: 3000,
          });
          
          // Schedule a test notification
          await LocalNotifications.schedule({
            notifications: [
              {
                title: "Habit Seed",
                body: "Notifications are now enabled!",
                id: 1,
                schedule: { at: new Date(Date.now() + 3000) },
                channelId: 'reminders'
              }
            ]
          });
        }
      }
    } catch (e) {
      console.error("Error requesting notification permission:", e);
      toast({
        title: "Permission Error",
        description: "Could not request notification permissions",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleReminderTimeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setReminderTime(newTime);
    
    try {
      if (window.Capacitor?.isNativePlatform()) {
        const { Preferences } = await import('@capacitor/preferences');
        await Preferences.set({ key: 'reminderTime', value: newTime });
        
        toast({
          title: "Reminder Updated",
          description: `Daily reminder set for ${newTime}`,
          duration: 3000,
        });
        
        // Re-schedule notifications if enabled
        if (notificationsEnabled) {
          const { LocalNotifications } = await import('@capacitor/local-notifications');
          
          // Cancel existing reminders
          await LocalNotifications.cancel({ notifications: [{ id: 999 }] });
          
          // Schedule new reminder
          const [hours, minutes] = newTime.split(':').map(Number);
          const now = new Date();
          const reminderDate = new Date();
          reminderDate.setHours(hours, minutes, 0);
          
          // If time has already passed for today, schedule for tomorrow
          if (reminderDate < now) {
            reminderDate.setDate(reminderDate.getDate() + 1);
          }
          
          await LocalNotifications.schedule({
            notifications: [
              {
                title: "Habit Seed",
                body: "Time to check in with your daily habits!",
                id: 999,
                schedule: {
                  at: reminderDate,
                  repeats: true,
                  every: 'day'
                },
                channelId: 'reminders'
              }
            ]
          });
        }
      }
    } catch (e) {
      console.error("Error saving reminder time:", e);
    }
  };

  // Handle export functionality
  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      // Get all data through the hooks
      const habitData = await exportHabits();
      
      // Create export data object
      const exportData = {
        habits: habitData.habits,
        completions: habitData.completions,
        settings: {
          maxHabits,
          showStreakBadges
        },
        exportDate: new Date().toISOString(),
        version: '1.0.0'
      };
      
      // Create file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      
      // Create and trigger download link
      const exportFileName = `habitSeed_backup_${new Date().toISOString().slice(0, 10)}.json`;
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileName);
      linkElement.click();
      
      toast({
        title: "Export Successful",
        description: "Your data has been exported successfully.",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting your data.",
        variant: "destructive",
        duration: 3000,
      });
      console.error("Export error:", error);
    } finally {
      setIsExporting(false);
    }
  };

  // Handle import functionality
  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsImporting(true);
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const importedData = JSON.parse(content);
        
        // Validate data structure
        if (!importedData.habits || !importedData.settings) {
          throw new Error("Invalid backup file format");
        }
        
        // Import habits
        await importHabits({
          habits: importedData.habits,
          completions: importedData.completions || {}
        });
        
        // Import settings - the settings hook will handle saving to IndexedDB
        if (importedData.settings) {
          setMaxHabits(importedData.settings.maxHabits || defaultSettings.maxHabits);
          setShowStreakBadges(importedData.settings.showStreakBadges !== undefined ? 
            importedData.settings.showStreakBadges : defaultSettings.showStreakBadges);
        }
        
        toast({
          title: "Import Successful",
          description: "Your data has been imported successfully. App will reload.",
          duration: 3000,
        });
        
        // Reset file input
        if (event.target) {
          event.target.value = '';
        }
        
        // Reload page to apply settings
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "There was an error importing your data. Please check your file format.",
          variant: "destructive",
          duration: 4000,
        });
        console.error("Import error:", error);
      } finally {
        setIsImporting(false);
      }
    };
    
    reader.onerror = () => {
      toast({
        title: "Import Failed",
        description: "There was an error reading the file.",
        variant: "destructive",
        duration: 3000,
      });
      setIsImporting(false);
    };
    
    reader.readAsText(file);
  };

  // For Settings page defaults if needed
  const defaultSettings = {
    maxHabits: 3,
    showStreakBadges: true
  };
  
  // Determine if all data is initialized
  const isLoaded = settingsInitialized && habitsInitialized;
  
  return (
    <Layout>
      <div className="py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
            <Badge variant={platform === "mobile" ? "default" : "outline"} className="h-6">
              {platform === "mobile" ? (
                <span className="flex items-center gap-1">
                  <Smartphone className="h-3 w-3" />
                  Mobile
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  Web
                </span>
              )}
            </Badge>
          </div>
          
          {/* Database status indicator */}
          <div className="flex items-center text-xs text-muted-foreground gap-1.5">
            <Database className="h-3.5 w-3.5" />
            {dbStatus === "checking" && (
              <span className="flex items-center gap-1">
                <RefreshCw className="h-3 w-3 animate-spin" />
                Checking storage...
              </span>
            )}
            {dbStatus === "capacitor" && (
              <span className="flex items-center gap-1 text-primary">
                <Check className="h-3 w-3" />
                Using Capacitor Storage
              </span>
            )}
            {dbStatus === "indexeddb" && (
              <span className="flex items-center gap-1 text-primary">
                <Check className="h-3 w-3" />
                Using IndexedDB
              </span>
            )}
            {dbStatus === "localstorage" && (
              <span>Using LocalStorage</span>
            )}
          </div>
        </div>
        
        {!isLoaded ? (
          <Card className="p-6">
            <div className="flex justify-center items-center gap-3">
              <RefreshCw className="h-5 w-5 animate-spin text-primary" />
              <p>Loading settings...</p>
            </div>
          </Card>
        ) : (
          <Tabs defaultValue="appearance" className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              {platform === "mobile" && (
                <TabsTrigger value="notifications">
                  <span className="flex items-center gap-1">
                    <BellRing className="h-3.5 w-3.5" />
                    Notifications
                  </span>
                </TabsTrigger>
              )}
              <TabsTrigger value="about">About</TabsTrigger>
            </TabsList>
            
            {/* Appearance Settings */}
            <TabsContent value="appearance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Theme</CardTitle>
                  <CardDescription>
                    Customize how Habit Seed looks for you
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="dark-mode">Dark Mode</Label>
                    <Switch 
                      id="dark-mode" 
                      checked={theme === 'dark'} 
                      onCheckedChange={toggleTheme} 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="streak-badges">Show Streak Badges</Label>
                    <Switch 
                      id="streak-badges" 
                      checked={showStreakBadges} 
                      onCheckedChange={setShowStreakBadges} 
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Habit Preferences */}
            <TabsContent value="preferences" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Habit Preferences</CardTitle>
                  <CardDescription>
                    Customize how your habits work
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="max-habits">Maximum Habits</Label>
                      <span className="text-sm font-medium">{maxHabits}</span>
                    </div>
                    <Slider 
                      id="max-habits"
                      min={1}
                      max={10}
                      step={1}
                      value={[maxHabits]}
                      onValueChange={(value) => setMaxHabits(value[0])}
                    />
                    <p className="text-xs text-muted-foreground">
                      Set the maximum number of habits you want to track (1-10)
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Data Management</CardTitle>
                  <CardDescription>
                    Manage your habit data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      className="w-full flex items-center justify-center" 
                      onClick={handleExport}
                      disabled={isExporting || habits.length === 0}
                    >
                      {isExporting ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      Export Data
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full flex items-center justify-center"
                      onClick={handleImportClick}
                      disabled={isImporting}
                    >
                      {isImporting ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      Import Data
                    </Button>
                    
                    {/* Hidden file input */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      accept=".json"
                      onChange={handleFileUpload}
                    />
                  </div>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full">
                        <Trash className="h-4 w-4 mr-2" />
                        Reset All Data
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete all your
                          habits and reset all application settings.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={clearAllData}>
                          Yes, delete everything
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Android Notifications - only shown on mobile */}
            {platform === "mobile" && (
              <TabsContent value="notifications" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                    <CardDescription>
                      Manage notifications for your daily habits
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="enable-notifications" className="flex flex-col gap-1">
                        <span>Enable Notifications</span>
                        <span className="font-normal text-xs text-muted-foreground">
                          Receive daily reminders for your habits
                        </span>
                      </Label>
                      <div className="space-x-2 flex items-center">
                        {!notificationsEnabled ? (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={requestNotificationPermission}
                          >
                            Enable
                          </Button>
                        ) : (
                          <Switch 
                            id="enable-notifications" 
                            checked={notificationsEnabled}
                            disabled={true}
                          />
                        )}
                      </div>
                    </div>
                    
                    {notificationsEnabled && (
                      <>
                        <Separator />
                        
                        <div className="space-y-3">
                          <Label htmlFor="reminder-time" className="flex flex-col gap-1">
                            <span>Daily Reminder Time</span>
                            <span className="font-normal text-xs text-muted-foreground">
                              Set when you'd like to be reminded
                            </span>
                          </Label>
                          <input
                            id="reminder-time"
                            type="time"
                            value={reminderTime}
                            onChange={handleReminderTimeChange}
                            className="h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
                          />
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Channels</CardTitle>
                    <CardDescription>
                      Manage different types of notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm space-y-5">
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <BellRing className="h-5 w-5 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-medium">Habit Reminders</h4>
                          <p className="text-xs text-muted-foreground">
                            Daily reminders to check in with your habits
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <span className="flex items-center justify-center h-5 w-5 text-primary">🔥</span>
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-medium">Streak Alerts</h4>
                          <p className="text-xs text-muted-foreground">
                            Get notified when you achieve a habit streak milestone
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <span className="flex items-center justify-center h-5 w-5 text-primary">🏆</span>
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-medium">Achievements</h4>
                          <p className="text-xs text-muted-foreground">
                            Celebrate your habit-building milestones and achievements
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mt-4">
                      For more granular control, you can customize each channel in your device's notification settings
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
            
            {/* About & Developer Info */}
            <TabsContent value="about" className="space-y-4">
              <Card className="border-primary/20">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🌱</span>
                    <CardTitle>About HabitSeed</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                  <p className="text-sm">
                    <strong>HabitSeed</strong> is a simple, mindful habit tracker that helps you grow your routines—one small step at a time.
                  </p>
                  <p className="text-sm">
                    Your habits start as a tiny seed 🌱 and evolve into a full-grown tree 🌳 as your streaks grow. With subtle animations, gentle reminders, and clean design, HabitSeed keeps you focused on what matters: consistency.
                  </p>
                  
                  <ul className="text-sm list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>Minimal interface, no clutter</li>
                    <li>Gentle reminders & weekly reflections</li>
                    <li>Visual growth for daily motivation</li>
                    <li>Built with privacy and simplicity in mind</li>
                    <li>Uses {platform === "mobile" ? "native storage" : "local storage"} for maximum privacy</li>
                    <li>{platform === "mobile" ? "Available on Android devices" : "Available as a progressive web app"}</li>
                  </ul>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                    <RefreshCw className="h-3 w-3" />
                    <span>Version: 1.0.0</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="relative overflow-hidden border-primary/20">
                <div className="absolute right-0 top-0 w-28 h-28 bg-muted/30 rounded-bl-full -z-0"></div>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">👤</span>
                    <CardTitle>About the Developer</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-3 pb-5 relative z-10">
                  <div className="flex flex-col items-center text-center gap-4">
                    <h3 className="text-lg font-medium">Abdul Haseeb</h3>
                    
                    <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-primary/20 flex-shrink-0">
                      <img 
                        src="/pic.png" 
                        alt="Abdul Haseeb" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="space-y-3 max-w-md">
                      <p className="text-sm">
                        Hi! I'm a developer who believes that the best tools are calm, focused, and respectful of your time and data. HabitSeed was created out of a love for habit-building and minimal design.
                      </p>
                      <p className="text-sm">
                        Thank you for using HabitSeed. I hope it helps you grow something meaningful 🌿
                      </p>
                      <div className="flex items-center justify-center gap-4 pt-1">
                        <a 
                          href="https://github.com/haseebno1" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                        >
                          <Github className="h-3.5 w-3.5" />
                          <span>GitHub</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </CardContent>
                
                <Separator className="mb-3" />
                
                <CardFooter className="text-xs text-muted-foreground pt-0">
                  &copy; {new Date().getFullYear()} HabitSeed. All rights reserved.
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </Layout>
  );
};

export default Settings; 