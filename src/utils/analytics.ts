// Analytics integration utility
export const analytics = {
  // Track page views
  trackPageView: (path: string) => {
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("config", "GA_MEASUREMENT_ID", {
        page_path: path,
      });
    }
    // Custom analytics
    console.log("Page view:", path);
  },

  // Track events
  trackEvent: (eventName: string, eventParams?: Record<string, any>) => {
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", eventName, eventParams);
    }
    console.log("Event:", eventName, eventParams);
  },

  // Track conversions
  trackConversion: (conversionType: string, value?: number) => {
    analytics.trackEvent("conversion", {
      conversion_type: conversionType,
      value: value,
    });
  },
};
