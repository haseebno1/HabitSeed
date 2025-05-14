import React, { useState, useEffect } from 'react';
import { Database, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { getStorageType } from '@/lib/storage/index';

interface StorageStatusProps {
  className?: string;
}

/**
 * StorageStatus component displays information about the current storage adapter being used
 */
const StorageStatus: React.FC<StorageStatusProps> = ({ className = '' }) => {
  const [storageType, setStorageType] = useState<'checking' | 'capacitor' | 'indexeddb' | 'localstorage'>('checking');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkStorageType = async () => {
      try {
        // Slight delay to avoid UI flicker
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const type = getStorageType();
        setStorageType(type);
      } catch (error) {
        console.error('Error detecting storage type:', error);
        setStorageType('localstorage'); // Fallback
      } finally {
        setIsLoading(false);
      }
    };
    
    checkStorageType();
  }, []);
  
  return (
    <div className={`flex items-center text-xs gap-1.5 ${className}`}>
      <Database className="h-3.5 w-3.5" />
      
      {isLoading && (
        <span className="flex items-center gap-1">
          <RefreshCw className="h-3 w-3 animate-spin" />
          Checking storage...
        </span>
      )}
      
      {!isLoading && storageType === 'capacitor' && (
        <span className="flex items-center gap-1 text-primary">
          <Check className="h-3 w-3" />
          Using Capacitor Storage
        </span>
      )}
      
      {!isLoading && storageType === 'indexeddb' && (
        <span className="flex items-center gap-1 text-primary">
          <Check className="h-3 w-3" />
          Using IndexedDB
        </span>
      )}
      
      {!isLoading && storageType === 'localstorage' && (
        <span className="flex items-center gap-1 text-muted-foreground">
          <AlertCircle className="h-3 w-3" />
          Using LocalStorage
        </span>
      )}
    </div>
  );
};

export default StorageStatus; 