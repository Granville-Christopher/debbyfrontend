// A/B Testing utility
export const abTesting = {
  // Get variant for a test
  getVariant: (testName: string, variants: string[]): string => {
    const storageKey = `ab_test_${testName}`;
    const stored = localStorage.getItem(storageKey);
    
    if (stored && variants.includes(stored)) {
      return stored;
    }

    // Assign variant based on user ID hash
    const userId = localStorage.getItem("userId") || Math.random().toString();
    const hash = userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const variant = variants[hash % variants.length];
    
    localStorage.setItem(storageKey, variant);
    return variant;
  },

  // Track conversion for variant
  trackConversion: (testName: string, variant: string, conversionType: string) => {
    console.log("A/B Test Conversion:", { testName, variant, conversionType });
    // Send to analytics
    if ((window as any).gtag) {
      (window as any).gtag("event", "ab_test_conversion", {
        test_name: testName,
        variant: variant,
        conversion_type: conversionType,
      });
    }
  },
};
