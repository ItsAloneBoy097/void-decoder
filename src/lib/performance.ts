/**
 * Performance optimization utilities
 */

// Image lazy loading observer
export const setupImageLazyLoading = () => {
  if ('loading' in HTMLImageElement.prototype) {
    // Native lazy loading is supported
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach((img) => {
      if (img instanceof HTMLImageElement && img.dataset.src) {
        img.src = img.dataset.src;
      }
    });
  } else {
    // Fallback to Intersection Observer
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            observer.unobserve(img);
          }
        }
      });
    });

    document.querySelectorAll('img[loading="lazy"]').forEach((img) => {
      imageObserver.observe(img);
    });
  }
};

// Debounce function for performance
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

// Throttle function for scroll/resize events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Preload critical resources
export const preloadCriticalResources = () => {
  const criticalImages = [
    // Add critical images that should be preloaded
  ];

  criticalImages.forEach((src) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });
};

// Check if user prefers reduced motion
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Format number for better readability and performance
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// Optimize images with proper sizing
export const getOptimizedImageUrl = (
  url: string,
  width: number,
  height: number
): string => {
  // If using Unsplash or similar service, append sizing parameters
  if (url.includes('unsplash.com')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}w=${width}&h=${height}&fit=crop&auto=format&q=80`;
  }
  return url;
};
