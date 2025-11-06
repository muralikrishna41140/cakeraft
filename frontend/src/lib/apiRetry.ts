/**
 * Retry utility for API requests
 * Handles transient network errors and server cold starts
 */

interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  retryCondition?: (error: any) => boolean;
}

/**
 * Retry an async function with exponential backoff
 * @param fn - Function to retry
 * @param options - Retry options
 * @returns Promise with the result
 */
export async function retryRequest<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    retryCondition = (error) => {
      // Retry on network errors or server errors (500+)
      return (
        !error.response ||
        error.code === 'ECONNABORTED' ||
        error.code === 'ERR_NETWORK' ||
        (error.response?.status >= 500 && error.response?.status < 600)
      );
    },
  } = options;

  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await fn();
      
      // Log success if this was a retry
      if (attempt > 0) {
        console.log(`✅ Request succeeded on attempt ${attempt + 1}`);
      }
      
      return result;
    } catch (error: any) {
      lastError = error;

      // Log the error details
      console.error(`❌ Attempt ${attempt + 1} failed:`, {
        status: error.response?.status,
        code: error.code,
        message: error.message
      });

      // Don't retry if it's the last attempt or if error shouldn't be retried
      if (attempt === maxRetries || !retryCondition(error)) {
        console.log(`🛑 Not retrying. Last attempt: ${attempt === maxRetries}, Should retry: ${retryCondition(error)}`);
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = retryDelay * Math.pow(2, attempt);
      
      console.log(
        `⏳ Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms...`
      );

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: any): boolean {
  return (
    !error.response ||
    error.code === 'ECONNABORTED' ||
    error.code === 'ERR_NETWORK' ||
    error.message?.includes('Network Error')
  );
}

/**
 * Check if error is a server error
 */
export function isServerError(error: any): boolean {
  return error.response?.status >= 500 && error.response?.status < 600;
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: any): string {
  if (error.code === 'ECONNABORTED') {
    return 'Request timeout. The server is taking too long to respond. If this is your first login, the server may be starting up (this can take 30-60 seconds on Render free tier). Please wait and try again.';
  }

  if (error.code === 'ERR_NETWORK') {
    return 'Network error. Please check your internet connection and try again.';
  }

  if (error.response?.status === 401) {
    return error.response?.data?.message || 'Invalid email or password. Please check your credentials and try again.';
  }

  if (error.response?.status === 404) {
    return error.response?.data?.message || 'Resource not found';
  }

  if (error.response?.status >= 500) {
    return error.response?.data?.message || 'Server error. Please try again later.';
  }

  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.message && !error.message.includes('undefined')) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}
