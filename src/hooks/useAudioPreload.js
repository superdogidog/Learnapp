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
      return;
    }

    let messageHandler;

    const registerServiceWorker = async () => {
      try {
        // Register the service worker
        const registration = await navigator.serviceWorker.register('/Learnapp/service-worker.js', {
          scope: '/Learnapp/'
        });
        
        console.log('Service Worker registered:', registration);

        // Wait for the service worker to be ready
        await navigator.serviceWorker.ready;
        console.log('Service Worker ready');

        // Set up message listener for preload completion
        messageHandler = (event) => {
          if (event.data && event.data.type === 'PRELOAD_COMPLETE') {
            console.log('Audio preload complete:', event.data.count, 'files');
            setIsPreloading(false);
            setPreloadComplete(true);
            setPreloadProgress(100);
            
            // Store completion status in localStorage
            localStorage.setItem('audioPreloadComplete', 'true');
            localStorage.setItem('audioPreloadTimestamp', Date.now().toString());
          }
        };

        navigator.serviceWorker.addEventListener('message', messageHandler);

        // Check if audio is already preloaded
        const preloadStatus = localStorage.getItem('audioPreloadComplete');
        const preloadTimestamp = localStorage.getItem('audioPreloadTimestamp');
        const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

        // If preloaded recently (within a week), don't preload again
        if (preloadStatus === 'true' && preloadTimestamp && parseInt(preloadTimestamp) > oneWeekAgo) {
          console.log('Audio already preloaded, skipping...');
          setPreloadComplete(true);
          setPreloadProgress(100);
          return;
        }

        // Start preloading audio files
        setIsPreloading(true);
        setPreloadProgress(10);

        // Get all audio URLs from the database
        const audioUrls = pinyinAudioDB
          .filter(item => item.audio)
          .map(item => {
            // Convert relative URL to absolute if needed
            const url = item.audio;
            if (url.startsWith('/')) {
              return url;
            }
            return url;
          });

        console.log('Starting audio preload:', audioUrls.length, 'files');
        setPreloadProgress(20);

        // Send message to service worker to preload audio
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'PRELOAD_AUDIO',
            urls: audioUrls
          });
        } else {
          // If no controller yet, wait a bit and try again
          setTimeout(() => {
            if (navigator.serviceWorker.controller) {
              navigator.serviceWorker.controller.postMessage({
                type: 'PRELOAD_AUDIO',
                urls: audioUrls
              });
            }
          }, 1000);
        }

      } catch (err) {
        console.error('Service Worker registration failed:', err);
        setError(err.message);
        setIsPreloading(false);
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
