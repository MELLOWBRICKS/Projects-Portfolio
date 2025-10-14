// Analytics and performance monitoring
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined') {
    // Google Analytics 4
    if (window.gtag) {
      window.gtag('event', eventName, properties)
    }
    
    // Custom analytics
    console.log('Event:', eventName, properties)
  }
}

export function trackPageView(url: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'GA_MEASUREMENT_ID', {
      page_path: url,
    })
  }
}

export function trackPerformance() {
  if (typeof window !== 'undefined') {
    // Core Web Vitals
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(console.log)
      getFID(console.log)
      getFCP(console.log)
      getLCP(console.log)
      getTTFB(console.log)
    })
  }
}

// Rate limiting monitoring
export function trackRateLimit(endpoint: string, remaining: number, reset: number) {
  trackEvent('rate_limit_status', {
    endpoint,
    remaining,
    reset,
    timestamp: Date.now()
  })
  
  if (remaining < 100) {
    console.warn(`Low rate limit for ${endpoint}: ${remaining} remaining`)
  }
}
