import { useState, useRef, useCallback } from 'react';

const useDownloadManager = () => {
  const [downloads, setDownloads] = useState<{[key: string]: {isDownloading: boolean; progress: number}}>({});
  const intervalsRef = useRef<{[key: string]: NodeJS.Timeout}>({});

  const startDownload = useCallback((key: string, simulateFunction: () => void) => {
    setDownloads(prev => {
      if (prev[key]?.isDownloading) return prev;

      return {
        ...prev,
        [key]: { isDownloading: true, progress: 0 }
      };
    });

    if (intervalsRef.current[key]) {
      clearInterval(intervalsRef.current[key]);
      delete intervalsRef.current[key];
    }

    simulateFunction();
  }, []);

  const updateProgress = useCallback((key: string, progress: number) => {
    setDownloads(prev => ({
      ...prev,
      [key]: { ...prev[key], progress }
    }));
  }, []);

  const finishDownload = useCallback((key: string) => {
    setDownloads(prev => ({
      ...prev,
      [key]: { isDownloading: false, progress: 0 }
    }));

    if (intervalsRef.current[key]) {
      clearInterval(intervalsRef.current[key]);
      delete intervalsRef.current[key];
    }
  }, []);

  const setInterval = useCallback((key: string, callback: () => void, delay: number) => {
    intervalsRef.current[key] = globalThis.setInterval(callback, delay);
  }, []);

  const clearAllIntervals = useCallback(() => {
    Object.values(intervalsRef.current).forEach(interval => {
      if (interval) clearInterval(interval);
    });
    intervalsRef.current = {};
  }, []);

  return {
    downloads,
    startDownload,
    updateProgress,
    finishDownload,
    setInterval,
    clearAllIntervals
  };
};

export default useDownloadManager;
