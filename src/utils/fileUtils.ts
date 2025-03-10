import JSZip from 'jszip';
import { toaster } from '@/components/ui/toaster';

const DB_NAME = 'FileStorage';
const STORE_NAME = 'files';
const DATA_DIR = '/data';
const TIMESTAMP_STORE = 'timestamps';

const getFullPath = (filename: string): string => {
  return `${DATA_DIR}/${filename}`;
};

// Initialize IndexedDB
const initDB = async (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'path' });
      }
      if (!db.objectStoreNames.contains(TIMESTAMP_STORE)) {
        db.createObjectStore(TIMESTAMP_STORE, { keyPath: 'path' });
      }
    };
  });
};

// Save file to IndexedDB
export const downloadFile = async (url: string, filename: string): Promise<void> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    const fullPath = getFullPath(filename);
    
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    await new Promise<void>((resolve, reject) => {
      const request = store.put({
        path: fullPath,
        data: blob,
        timestamp: new Date()
      });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    await recordFileDownload(filename);
  } catch (error) {
    throw error;
  }
};

// Check if file exists in IndexedDB
export const checkFile = async (filename: string): Promise<{ exists: boolean; lastModified?: Date }> => {
  try {
    const fullPath = getFullPath(filename);
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    const result = await new Promise<any>((resolve) => {
      const request = store.get(fullPath);
      request.onsuccess = () => resolve(request.result);
    });

    // Show data processing message
    toaster.create({
    title: 'Refreshing local data',
    description: 'Processing card database...',
    type: 'info',
    duration: 3000,
    });
    
    return result ? {
      exists: true,
      lastModified: new Date(result.timestamp)
    } : { exists: false };
  } catch {
    return { exists: false };
  }
};

// Load and unzip file from IndexedDB
export const loadFile = async (filename: string): Promise<any> => {
  try {
    const fullPath = getFullPath(filename);
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    const result = await new Promise<any>((resolve, reject) => {
      const request = store.get(fullPath);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    if (!result) {
      throw new Error('File not found');
    }
    
    const zipData = await result.data.arrayBuffer();
    const zip = new JSZip();
    const contents = await zip.loadAsync(zipData);
    
    const jsonFileName = filename.replace('.zip', '');
    const jsonFile = contents.file(jsonFileName);
    if (!jsonFile) {
      throw new Error('No JSON file found in zip archive');
    }

    const jsonContent = await jsonFile.async('string');
    return JSON.parse(jsonContent);
  } catch (error) {
    console.error('Error loading file:', error);
    throw error;
  }
};

// Add back recordFileDownload function
export const recordFileDownload = async (filename: string): Promise<void> => {
  try {
    const fullPath = getFullPath(filename);
    const db = await initDB();
    const transaction = db.transaction([TIMESTAMP_STORE], 'readwrite');
    const store = transaction.objectStore(TIMESTAMP_STORE);
    
    await new Promise<void>((resolve, reject) => {
      const request = store.put({
        path: fullPath,
        timestamp: new Date().toISOString()
      });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error recording file download:', error);
  }
};
