// Performance optimization utilities

/**
 * Debounce function to limit rate of execution
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  waitMs: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
    }, waitMs);
  };
};

/**
 * Throttle function to ensure it's called at most once per interval
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limitMs: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();

    if (now - lastCall >= limitMs) {
      lastCall = now;
      func(...args);
    }
  };
};

/**
 * Memoize function results
 */
export const memoize = <T extends (...args: any[]) => any>(
  func: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T => {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>) => {
    const key = keyGenerator
      ? keyGenerator(...args)
      : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

/**
 * Batch multiple function calls into one
 */
export const batchCalls = <T>(
  batchSize: number,
  batchDelayMs: number,
  processBatch: (items: T[]) => void
) => {
  let batch: T[] = [];
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const flush = () => {
    if (batch.length > 0) {
      processBatch([...batch]);
      batch = [];
    }
    timeoutId = null;
  };

  return (item: T) => {
    batch.push(item);

    if (batch.length >= batchSize) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      flush();
    } else if (!timeoutId) {
      timeoutId = setTimeout(flush, batchDelayMs);
    }
  };
};

/**
 * Lazy load component
 */
export const lazyLoadWithRetry = (
  importFunc: () => Promise<any>,
  retries: number = 3,
  retryDelayMs: number = 1000
): Promise<any> => {
  return new Promise((resolve, reject) => {
    importFunc()
      .then(resolve)
      .catch((error) => {
        if (retries === 0) {
          reject(error);
          return;
        }

        setTimeout(() => {
          lazyLoadWithRetry(importFunc, retries - 1, retryDelayMs)
            .then(resolve)
            .catch(reject);
        }, retryDelayMs);
      });
  });
};

/**
 * Intersection Observer for lazy loading
 */
export const createLazyLoader = (
  callback: (entry: IntersectionObserverEntry) => void,
  options?: IntersectionObserverInit
) => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        callback(entry);
        observer.unobserve(entry.target);
      }
    });
  }, options);

  return {
    observe: (element: Element) => observer.observe(element),
    disconnect: () => observer.disconnect()
  };
};
