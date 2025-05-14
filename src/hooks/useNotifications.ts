import { useState, useEffect } from "react";
import { isCapacitorApp } from "@/lib/capacitor-storage";
import type { PendingLocalNotificationSchema } from '@capacitor/local-notifications';

export interface Notification {
  id: number;
  title: string;
  body: string;
  schedule?: {
    at?: Date;
    repeats?: boolean;
    every?: 'day' | 'week' | 'month' | 'year';
    count?: number;
    on?: {
      day?: number;
      hour?: number;
      minute?: number;
    };
  };
}

export interface NotificationPermission {
  display: 'granted' | 'denied' | 'default' | 'prompt';
}

export const useNotifications = () => {
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [reminderTime, setReminderTime] = useState<string>("20:00");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize the notification system
  useEffect(() => {
    const initNotifications = async () => {
      setIsLoading(true);
      
      try {
        if (isCapacitorApp()) {
          // Handle native notifications with Capacitor
          const { LocalNotifications } = await import('@capacitor/local-notifications');
          const { Preferences } = await import('@capacitor/preferences');
          
          // Check current permission status
          const perms = await LocalNotifications.checkPermissions();
          setIsEnabled(perms.display === 'granted');
          setIsSupported(true);
          
          // Load saved reminder time
          const savedTime = await Preferences.get({ key: 'reminderTime' });
          if (savedTime.value) {
            setReminderTime(savedTime.value);
          }
        } else if ('Notification' in window) {
          // Handle web notifications
          setIsSupported(true);
          setIsEnabled(Notification.permission === 'granted');
          
          // Load saved reminder time from localStorage
          const savedTime = localStorage.getItem('reminderTime');
          if (savedTime) {
            setReminderTime(savedTime);
          }
        } else {
          // Notifications not supported
          setIsSupported(false);
          setIsEnabled(false);
        }
      } catch (error) {
        console.error('Error initializing notifications:', error);
        setIsSupported(false);
        setIsEnabled(false);
      } finally {
        setIsLoading(false);
      }
    };

    initNotifications();
  }, []);

  // Request notification permissions
  const requestPermission = async (): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      if (isCapacitorApp()) {
        // Request native permissions with Capacitor
        const { LocalNotifications } = await import('@capacitor/local-notifications');
        const perms = await LocalNotifications.requestPermissions();
        const granted = perms.display === 'granted';
        setIsEnabled(granted);
        return granted;
      } else if ('Notification' in window) {
        // Request web notification permissions
        const permission = await Notification.requestPermission();
        const granted = permission === 'granted';
        setIsEnabled(granted);
        return granted;
      }
      
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Schedule a notification
  const scheduleNotification = async (notification: Notification): Promise<boolean> => {
    try {
      if (!isEnabled) return false;
      
      if (isCapacitorApp()) {
        // Use Capacitor for native notifications
        const { LocalNotifications } = await import('@capacitor/local-notifications');
        
        await LocalNotifications.schedule({
          notifications: [{
            id: notification.id,
            title: notification.title,
            body: notification.body,
            schedule: notification.schedule,
            channelId: 'reminders'
          }]
        });
        
        return true;
      } else if ('Notification' in window && Notification.permission === 'granted') {
        // Use Web Notifications API as fallback
        if (notification.schedule?.at) {
          const now = new Date();
          const scheduledTime = notification.schedule.at;
          const delay = scheduledTime.getTime() - now.getTime();
          
          if (delay > 0) {
            setTimeout(() => {
              new Notification(notification.title, {
                body: notification.body,
                icon: '/icon.png'
              });
            }, delay);
            return true;
          }
        } else {
          // Show immediately if no schedule
          new Notification(notification.title, {
            body: notification.body,
            icon: '/icon.png'
          });
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return false;
    }
  };

  // Set daily reminder
  const setDailyReminder = async (time: string): Promise<boolean> => {
    try {
      setReminderTime(time);
      
      // Save the reminder time
      if (isCapacitorApp()) {
        const { Preferences } = await import('@capacitor/preferences');
        await Preferences.set({ key: 'reminderTime', value: time });
      } else {
        localStorage.setItem('reminderTime', time);
      }
      
      // Cancel existing reminders
      await cancelAllReminders();
      
      // Parse time string (format: HH:MM)
      const [hours, minutes] = time.split(':').map(Number);
      
      // Create date object for today at the specified time
      const reminderDate = new Date();
      reminderDate.setHours(hours, minutes, 0, 0);
      
      // If the time has already passed today, schedule for tomorrow
      const now = new Date();
      if (reminderDate < now) {
        reminderDate.setDate(reminderDate.getDate() + 1);
      }
      
      // Schedule the daily reminder
      return await scheduleNotification({
        id: 1001, // Use a specific ID for daily reminders
        title: 'HabitSeed Reminder',
        body: 'Time to check in with your habits for today!',
        schedule: {
          at: reminderDate,
          repeats: true,
          every: 'day'
        }
      });
    } catch (error) {
      console.error('Error setting daily reminder:', error);
      return false;
    }
  };

  // Cancel all scheduled reminders
  const cancelAllReminders = async (): Promise<boolean> => {
    try {
      if (isCapacitorApp()) {
        const { LocalNotifications } = await import('@capacitor/local-notifications');
        // Use appropriate method from the plugin
        const pendingNotifications = await LocalNotifications.getPending();
        const notificationIds = pendingNotifications.notifications.map(n => ({ id: n.id }));
        
        if (notificationIds.length > 0) {
          await LocalNotifications.cancel({ notifications: notificationIds });
        }
        return true;
      }
      
      // For web, we can't cancel scheduled timeouts easily
      // This is a limitation of web notifications
      return false;
    } catch (error) {
      console.error('Error canceling reminders:', error);
      return false;
    }
  };

  // Cancel a specific notification by ID
  const cancelNotification = async (id: number): Promise<boolean> => {
    try {
      if (isCapacitorApp()) {
        const { LocalNotifications } = await import('@capacitor/local-notifications');
        await LocalNotifications.cancel({ notifications: [{ id }] });
        return true;
      }
      
      // For web, we can't cancel scheduled timeouts easily
      return false;
    } catch (error) {
      console.error(`Error canceling notification ${id}:`, error);
      return false;
    }
  };

  // Get all pending notifications
  const getPendingNotifications = async (): Promise<Notification[]> => {
    try {
      if (isCapacitorApp()) {
        const { LocalNotifications } = await import('@capacitor/local-notifications');
        const pending = await LocalNotifications.getPending();
        
        // Convert PendingLocalNotificationSchema to our Notification interface
        return pending.notifications.map(notification => ({
          id: notification.id,
          title: notification.title || "",
          body: notification.body || "",
          schedule: notification.schedule ? {
            at: notification.schedule.at ? new Date(notification.schedule.at) : undefined,
            repeats: notification.schedule.repeats,
            every: notification.schedule.every as "day" | "week" | "month" | "year",
          } : undefined
        }));
      }
      
      // Web doesn't support retrieving pending notifications
      return [];
    } catch (error) {
      console.error('Error getting pending notifications:', error);
      return [];
    }
  };

  return {
    isSupported,
    isEnabled,
    isLoading,
    reminderTime,
    requestPermission,
    scheduleNotification,
    setDailyReminder,
    cancelAllReminders,
    cancelNotification,
    getPendingNotifications
  };
}; 