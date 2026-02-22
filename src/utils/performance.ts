// Performance monitoring utility
export const performanceMonitor = {
  // Measure page load time
  measurePageLoad: () => {
    if (typeof window !== "undefined" && window.performance) {
      window.addEventListener("load", () => {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        const domReadyTime = perfData.domContentLoadedEventEnd - perfData.navigationStart;
        
        console.log("Performance Metrics:", {
          pageLoadTime: `${pageLoadTime}ms`,
          domReadyTime: `${domReadyTime}ms`,
        });

        // Send to analytics
        if ((window as any).gtag) {
          (window as any).gtag("event", "page_load_time", {
            value: pageLoadTime,
            metric_name: "page_load_time",
          });
        }
      });
    }
  },

  // Measure component render time
  measureComponentRender: (componentName: string) => {
    const start = performance.now();
    return () => {
      const end = performance.now();
      const renderTime = end - start;
      console.log(`${componentName} render time: ${renderTime.toFixed(2)}ms`);
    };
  },

  // Monitor Web Vitals
  monitorWebVitals: () => {
    if (typeof window !== "undefined" && "PerformanceObserver" in window) {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        console.log("LCP:", lastEntry.renderTime || lastEntry.loadTime);
      });
      lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          console.log("FID:", entry.processingStart - entry.startTime);
        });
      });
      fidObserver.observe({ entryTypes: ["first-input"] });

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        console.log("CLS:", clsValue);
      });
      clsObserver.observe({ entryTypes: ["layout-shift"] });
    }
  },
};
