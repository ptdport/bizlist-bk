// A singleton to manage Google Maps API loading across the application

let isLoading = false;
let isLoaded = false;

// Create a promise that will resolve when the API is loaded
let loadPromise: Promise<void> | null = null;

export const loadGoogleMapsApi = (): Promise<void> => {
  // If already loaded, return a resolved promise
  if (isLoaded && window.google?.maps?.places) {
    return Promise.resolve();
  }

  // If currently loading, return the existing promise
  if (isLoading && loadPromise) {
    return loadPromise;
  }

  // Start loading
  isLoading = true;

  // Create a new promise for loading the script
  loadPromise = new Promise<void>((resolve, reject) => {
    // Check if the script already exists
    if (document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]')) {
      // If script exists but not fully loaded, wait for it
      const checkGoogleExists = setInterval(() => {
        if (window.google?.maps?.places) {
          clearInterval(checkGoogleExists);
          isLoaded = true;
          resolve();
        }
      }, 100);
      
      // Set a timeout to prevent infinite checking
      setTimeout(() => {
        clearInterval(checkGoogleExists);
        if (!isLoaded) {
          reject(new Error('Google Maps API failed to load'));
        }
      }, 10000);
      
      return;
    }

    // Create and append the script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      isLoaded = true;
      resolve();
    };
    
    script.onerror = () => {
      isLoading = false;
      isLoaded = false;
      reject(new Error('Google Maps API failed to load'));
    };
    
    document.head.appendChild(script);
  });

  return loadPromise;
};

export const isGoogleMapsLoaded = (): boolean => {
  return isLoaded && !!window.google?.maps?.places;
};