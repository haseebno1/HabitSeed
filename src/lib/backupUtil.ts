import { HabitExportData } from "@/hooks/useHabits";
import storageAdapter from "./storage/index";
import { ErrorHandler, ErrorType, AppError } from "./errorHandling";
import { generateUUID } from "./utils";

// Define backup format version for compatibility checks
const BACKUP_FORMAT_VERSION = "2.0.0";

// Define the structure of our backup file with metadata
export interface BackupData {
  version: string;
  timestamp: string;
  deviceInfo: {
    platform: string;
    appVersion: string;
    userAgent?: string;
  };
  metadata: {
    habitCount: number;
    completionCount: number;
    dateRange: {
      start: string;
      end: string;
    };
    id: string;
  };
  data: HabitExportData;
}

/**
 * BackupUtil provides utilities for backing up and restoring app data
 */
export const BackupUtil = {
  /**
   * Create a backup file of all app data with metadata
   */
  async createBackup(): Promise<BackupData> {
    return ErrorHandler.executeWithErrorHandling(async () => {
      // Get the raw data from storage adapter
      const exportData = await storageAdapter.exportAllData();
      
      // Get date range of completions
      const dates = Object.keys(exportData.completions);
      const sortedDates = [...dates].sort();
      const startDate = sortedDates[0] || new Date().toISOString().split('T')[0];
      const endDate = sortedDates[sortedDates.length - 1] || new Date().toISOString().split('T')[0];
      
      // Count completions
      let completionCount = 0;
      for (const date in exportData.completions) {
        completionCount += exportData.completions[date].length;
      }
      
      // Create backup object with metadata
      const backup: BackupData = {
        version: BACKUP_FORMAT_VERSION,
        timestamp: new Date().toISOString(),
        deviceInfo: {
          platform: typeof window !== 'undefined' && (window as any)?.Capacitor?.isNativePlatform() 
            ? 'mobile' 
            : 'web',
          appVersion: '1.0.0', // Replace with actual app version when available
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
        },
        metadata: {
          habitCount: exportData.habits.length,
          completionCount,
          dateRange: {
            start: startDate,
            end: endDate
          },
          id: generateUUID()
        },
        data: exportData
      };
      
      return backup;
    }, "Create Backup");
  },
  
  /**
   * Save backup to a file
   */
  async downloadBackup(): Promise<string> {
    return ErrorHandler.executeWithErrorHandling(async () => {
      const backup = await this.createBackup();
      
      // Convert to JSON
      const backupJson = JSON.stringify(backup, null, 2);
      
      // Create blob and download link
      const blob = new Blob([backupJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Format date for filename
      const date = new Date();
      const dateStr = date.toISOString().split('T')[0];
      const filename = `habitSeed_backup_${dateStr}.json`;
      
      // Create and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 0);
      
      return filename;
    }, "Download Backup");
  },
  
  /**
   * Validate a backup file for compatibility
   */
  validateBackup(backupData: any): { valid: boolean; issues: string[] } {
    const issues: string[] = [];
    
    // Check if it's a valid JSON object
    if (!backupData || typeof backupData !== 'object') {
      issues.push('Invalid backup format: not a valid JSON object');
      return { valid: false, issues };
    }
    
    // Check version
    if (!backupData.version) {
      issues.push('Missing backup version');
    } else {
      // Simple version check - could be more sophisticated with semantic versioning
      const [major] = backupData.version.split('.');
      const [currentMajor] = BACKUP_FORMAT_VERSION.split('.');
      
      if (parseInt(major) < parseInt(currentMajor)) {
        issues.push(`Backup version (${backupData.version}) is older than current format (${BACKUP_FORMAT_VERSION}). Migration may be needed.`);
      }
    }
    
    // Check for required data fields
    if (!backupData.data) {
      issues.push('Missing data field in backup');
    } else {
      // Check for habits array
      if (!backupData.data.habits || !Array.isArray(backupData.data.habits)) {
        issues.push('Missing or invalid habits data');
      }
      
      // Check for completions object
      if (!backupData.data.completions || typeof backupData.data.completions !== 'object') {
        issues.push('Missing or invalid completions data');
      }
    }
    
    // Check for timestamp
    if (!backupData.timestamp) {
      issues.push('Missing backup timestamp');
    }
    
    // Check metadata
    if (!backupData.metadata) {
      issues.push('Missing backup metadata');
    }
    
    return {
      valid: issues.length === 0,
      issues
    };
  },
  
  /**
   * Restore data from a backup file with validation
   */
  async restoreFromBackup(backupData: BackupData): Promise<boolean> {
    return ErrorHandler.executeWithErrorHandling(async () => {
      // Validate the backup
      const validation = this.validateBackup(backupData);
      
      if (!validation.valid) {
        throw new AppError(
          `Invalid backup file: ${validation.issues.join(', ')}`,
          ErrorType.UserInput
        );
      }
      
      // Restore data
      await storageAdapter.importAllData(backupData.data);
      
      return true;
    }, "Restore Backup");
  },
  
  /**
   * Read a backup file and parse its contents
   */
  async readBackupFile(file: File): Promise<BackupData> {
    return ErrorHandler.executeWithErrorHandling(async () => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (event) => {
          try {
            const content = event.target?.result as string;
            const backupData = JSON.parse(content);
            
            // Validate the backup
            const validation = this.validateBackup(backupData);
            
            if (!validation.valid) {
              reject(new AppError(
                `Invalid backup file: ${validation.issues.join(', ')}`,
                ErrorType.UserInput
              ));
              return;
            }
            
            resolve(backupData);
          } catch (error) {
            reject(new AppError(
              `Failed to parse backup file: ${error instanceof Error ? error.message : String(error)}`,
              ErrorType.UserInput,
              error instanceof Error ? error : undefined
            ));
          }
        };
        
        reader.onerror = () => {
          reject(new AppError('Error reading file', ErrorType.UserInput));
        };
        
        reader.readAsText(file);
      });
    }, "Read Backup File");
  },
  
  /**
   * Extract summary information from a backup file
   */
  getBackupSummary(backup: BackupData): {
    habitCount: number;
    completionCount: number;
    dateRange: string;
    backupDate: string;
    platform: string;
  } {
    const backupDate = new Date(backup.timestamp);
    const formattedBackupDate = backupDate.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const startDate = new Date(backup.metadata.dateRange.start);
    const endDate = new Date(backup.metadata.dateRange.end);
    
    const formattedStartDate = startDate.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    const formattedEndDate = endDate.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    return {
      habitCount: backup.metadata.habitCount,
      completionCount: backup.metadata.completionCount,
      dateRange: `${formattedStartDate} to ${formattedEndDate}`,
      backupDate: formattedBackupDate,
      platform: backup.deviceInfo.platform.charAt(0).toUpperCase() + backup.deviceInfo.platform.slice(1)
    };
  }
}; 