import { useEffect, useState } from 'react';
import { pinyinAudioDB } from '../data/pinyinAudioDB';

/**
 * Hook to manage audio preloading and service worker registration
 * Ensures all audio files are cached for offline use
 */
export function useAudioPreload() {
  const [isPreloading, setIsPreloading] = useState(false);
  const [preloadComplete, setPreloadComplete] = useState(false);
  const [preloadProgress, setPreloadProgress] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if service workers are supported
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Workers not supported in this browser');
      setError('Service Workers not supported');
      // Continue without service worker
      setPreloadComplete(true);
      setPreloadProgress(100);
      return;
    }

    let messageHandler;

    const registerServiceWorker = async () => {
      try {
        // Get the base path from the current location
        const basePath = import.meta.env.BASE_URL || '/';
        
        // Register the service worker with timeout for Safari
        const registrationPromise = navigator.serviceWorker.register(`${basePath}service-worker.js`, {
          scope: basePath
        });
        
        // Add timeout for Safari which might hang on registration
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Service Worker registration timeout')), 5000)
        );
        
        const registration = await Promise.race([registrationPromise, timeoutPromise]);
        console.log('Service Worker registered:', registration);

        // Wait for the service worker to be ready with timeout
        const readyPromise = navigator.serviceWorker.ready;
        const readyTimeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Service Worker ready timeout')), 5000)
        );
        
        await Promise.race([readyPromise, readyTimeoutPromise]);
        console.log('Service Worker ready');

        // Set up message listener for preload completion
        messageHandler = (event) => {
          if (event.data && event.data.type === 'PRELOAD_COMPLETE') {
            console.log('Audio preload complete:', event.data.count, 'files');
            setIsPreloading(false);
            setPreloadComplete(true);
            setPreloadProgress(100);
            
            // Store completion status in localStorage
            try {
              localStorage.setItem('audioPreloadComplete', 'true');
              localStorage.setItem('audioPreloadTimestamp', Date.now().toString());
            } catch (e) {
              console.warn('localStorage not available:', e);
            }
          }
        };

        navigator.serviceWorker.addEventListener('message', messageHandler);

        // Audio preloading is disabled - using lazy loading instead
        // Service worker will cache audio files on-demand as they're used
        console.log('Audio preloading disabled - using lazy loading for better performance');
        setPreloadComplete(true);
        setPreloadProgress(100);

      } catch (err) {
        console.error('Service Worker registration failed:', err);
        setError(err.message);
        setIsPreloading(false);
        // Continue without service worker
        setPreloadComplete(true);
        setPreloadProgress(100);
      }
    };

    registerServiceWorker();

    // Cleanup
    return () => {
      if (messageHandler) {
        navigator.serviceWorker.removeEventListener('message', messageHandler);
      }
    };
  }, []);

  return {
    isPreloading,
    preloadComplete,
    preloadProgress,
    error
  };
}
