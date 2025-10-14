// Performance monitoring configuration
export const PERFORMANCE_THRESHOLDS = {
  // Core Web Vitals
  LCP: 2500, // Largest Contentful Paint (ms)
  FID: 100,  // First Input Delay (ms)
  CLS: 0.1,  // Cumulative Layout Shift
  
  // Custom metrics
  API_RESPONSE_TIME: 1000, // GitHub API response time (ms)
  CACHE_HIT_RATE: 0.8,     // Minimum cache hit rate
  ERROR_RATE: 0.05,        // Maximum error rate (5%)
}

export const MONITORING_CONFIG = {
  // Rate limiting alerts
  RATE_LIMIT_WARNING: 100,  // Warn when < 100 requests remaining
  RATE_LIMIT_CRITICAL: 10,  // Critical when < 10 requests remaining
  
  // Performance budgets
  BUNDLE_SIZE_LIMIT: 500,   // KB
  IMAGE_SIZE_LIMIT: 100,    // KB per image
  
  // User experience
  LOADING_STATE_TIMEOUT: 5000, // Show error after 5s
}
