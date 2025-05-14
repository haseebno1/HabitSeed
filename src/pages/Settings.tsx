import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import PageTransition from "@/components/PageTransition";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useTheme } from "@/components/ThemeProvider";
import { useSettings } from "@/hooks/useSettings";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Slider } from "@/components/ui/slider";
import { Trash, RefreshCw, Download, Upload, Github, ExternalLink, Check, Database, Smartphone, Globe, Bell } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { useHabits } from "@/hooks/useHabits";
import storage, { isIndexedDBSupported } from "@/lib/storage";
import { isCapacitorApp } from "@/lib/capacitor-storage";
import { Badge } from "@/components/ui/badge";
import { NotificationSettings } from "@/components/NotificationSettings";
import { themes } from "@/lib/themes";
import StorageStatus from "@/components/StorageStatus";

const Settings = () => {
  const { colorMode, toggleColorMode, theme, setTheme } = useTheme();
  const { maxHabits, setMaxHabits, showStreakBadges, setShowStreakBadges, clearAllData, isInitialized: settingsInitialized } = useSettings();
  const { habits, exportHabits, importHabits, isInitialized: habitsInitialized } = useHabits();
  const { toast } = useToast();
  
  // For file input reference
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [platform, setPlatform] = useState<"web" | "mobile">("web");
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  // Add a loading timeout to prevent infinite loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingTimeout(true);
    }, 5000); // 5 seconds timeout
    
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    // Check platform
    const isMobile = isCapacitorApp();
    setPlatform(isMobile ? "mobile" : "web");
  }, []);

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
      <PageTransition>
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
            <StorageStatus />
          </div>
          
          {!isLoaded && !loadingTimeout ? (
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
                      <Bell className="h-3.5 w-3.5" />
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
                        checked={colorMode === 'dark'} 
                        onCheckedChange={toggleColorMode} 
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
                    
                    <div className="space-y-2 pt-3">
                      <Label>App Theme</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {themes.map((themeOption) => (
                          <button
                            key={themeOption.id}
                            type="button"
                            onClick={() => setTheme(themeOption.id)}
                            className={`p-3 rounded-lg border transition-all ${
                              theme === themeOption.id 
                                ? "border-primary bg-primary/10 text-primary" 
                                : "border-border bg-card hover:bg-accent/50"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{themeOption.emoji}</span>
                              <span className="font-medium">{themeOption.name}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 text-left">
                              {themeOption.description}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Theme Preview</CardTitle>
                    <CardDescription>
                      See how your selected theme looks
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <div className="theme-color-preview bg-background"></div>
                        <p className="text-xs text-center text-muted-foreground">Background</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="theme-color-preview bg-card"></div>
                        <p className="text-xs text-center text-muted-foreground">Card</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="theme-color-preview bg-primary"></div>
                        <p className="text-xs text-center text-muted-foreground">Primary</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="theme-color-preview bg-secondary"></div>
                        <p className="text-xs text-center text-muted-foreground">Secondary</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="theme-color-preview bg-accent"></div>
                        <p className="text-xs text-center text-muted-foreground">Accent</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="theme-color-preview bg-muted"></div>
                        <p className="text-xs text-center text-muted-foreground">Muted</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-center mt-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={toggleColorMode}
                        className="text-xs"
                      >
                        {colorMode === 'light' ? 'Preview Dark Mode' : 'Preview Light Mode'}
                      </Button>
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
                        defaultValue={[maxHabits]} 
                        value={[maxHabits]}
                        onValueChange={(values) => setMaxHabits(values[0])}
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-muted-foreground">
                        Set the maximum number of habits you want to track (1-10)
                      </p>
                    </div>
                    
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="streak-badges-setting">Show Streak Badges</Label>
                        <Switch 
                          id="streak-badges-setting"
                          checked={showStreakBadges} 
                          onCheckedChange={setShowStreakBadges} 
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Show or hide badges indicating your habit streaks
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
                  <NotificationSettings />
                  
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
                            <Bell className="h-5 w-5 text-primary" />
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
                <Card className="overflow-hidden border-primary/20">
                  <div className="relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full -z-0"></div>
                    <CardHeader className="relative z-10">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full">🌱</span>
                        <div>
                          <CardTitle>HabitSeed</CardTitle>
                          <CardDescription>Grow your habits, one day at a time</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 relative z-10">
                      <p className="text-sm">
                        <strong>HabitSeed</strong> is a simple, mindful habit tracker that helps you nurture consistent routines.
                      </p>
                      
                      <div className="bg-card border rounded-lg p-4 space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="text-xl mt-0.5">🌱→🌳</div>
                          <div>
                            <h4 className="text-sm font-medium">Growth Visualization</h4>
                            <p className="text-xs text-muted-foreground">Watch your habits grow from seeds to trees as you build consistency</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className="text-xl mt-0.5">🔔</div>
                          <div>
                            <h4 className="text-sm font-medium">Smart Reminders</h4>
                            <p className="text-xs text-muted-foreground">Optional notifications help you stay on track with your goals</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className="text-xl mt-0.5">🔐</div>
                          <div>
                            <h4 className="text-sm font-medium">Privacy-Focused</h4>
                            <p className="text-xs text-muted-foreground">All data stays on your device, with no account required</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center text-xs text-muted-foreground border-t pt-3 mt-1">
                        <div className="flex items-center gap-2">
                          <RefreshCw className="h-3.5 w-3.5" />
                          <span>Version 1.1.0</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span>Storage:</span>
                          <StorageStatus className="mt-0" />
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
                
                <Card className="overflow-hidden border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-base">About the Developer</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20 flex-shrink-0">
                        <img 
                          src="/pic.png" 
                          alt="Abdul Haseeb" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium">Abdul Haseeb</h3>
                        <p className="text-xs text-muted-foreground">Software Engineer & Designer</p>
                        <div className="flex items-center gap-3 mt-2">
                          <a 
                            href="https://github.com/haseebno1" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                          >
                            <Github className="h-3.5 w-3.5" />
                            <span>GitHub</span>
                          </a>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-4">
                      HabitSeed was created with the belief that small, consistent actions lead to meaningful change. 
                      Thank you for using this app — I hope it helps you grow something amazing.
                    </p>
                  </CardContent>
                  <CardFooter className="text-xs text-muted-foreground border-t pt-3">
                    &copy; {new Date().getFullYear()} HabitSeed. All rights reserved.
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </PageTransition>
    </Layout>
  );
};

export default Settings; 