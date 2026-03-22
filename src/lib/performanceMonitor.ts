// Performance monitoring utility for tracking render times and metrics
import React from "react";

interface PerformanceMetric {
  name: string;
  startTime: number;
  duration?: number;
  endTime?: number;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private marks: Map<string, number> = new Map();

  /**
   * Start measuring a performance metric
   */
  start(name: string): void {
    if (typeof window === "undefined") return;

    const startTime = performance.now();
    this.metrics.set(name, { name, startTime });
    this.marks.set(name, startTime);
  }

  /**
   * End measuring a performance metric
   */
  end(name: string): number {
    if (typeof window === "undefined") return 0;

    const endTime = performance.now();
    const metric = this.metrics.get(name);

    if (metric) {
      const duration = endTime - metric.startTime;
      metric.endTime = endTime;
      metric.duration = duration;

      // Log slow operations (> 50ms)
      if (duration > 50) {
        console.warn(
          `[PERF] Slow operation: ${name} took ${duration.toFixed(2)}ms`,
        );
      }

      return duration;
    }

    return 0;
  }

  /**
   * Mark a point in time
   */
  mark(name: string): void {
    if (typeof window === "undefined") return;
    this.marks.set(name, performance.now());
  }

  /**
   * Measure time between two marks
   */
  measure(name: string, startMark: string, endMark: string): number {
    const startTime = this.marks.get(startMark);
    const endTime = this.marks.get(endMark);

    if (!startTime || !endTime) {
      console.warn(`[PERF] Marks not found: ${startMark}, ${endMark}`);
      return 0;
    }

    const duration = endTime - startTime;
    console.log(`[PERF] ${name}: ${duration.toFixed(2)}ms`);
    return duration;
  }

  /**
   * Get all metrics
   */
  getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values()).filter((m) => m.duration);
  }

  /**
   * Get average duration across multiple measurements
   */
  getAverageDuration(name: string): number {
    const metric = this.metrics.get(name);
    return metric?.duration ?? 0;
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
    this.marks.clear();
  }

  /**
   * Report metrics (useful for debugging)
   */
  report(): void {
    const metrics = this.getMetrics();
    if (metrics.length === 0) {
      console.log("[PERF] No metrics recorded");
      return;
    }

    console.group("[PERF] Performance Report");
    metrics.forEach((m) => {
      console.log(`${m.name}: ${m.duration?.toFixed(2)}ms`);
    });
    console.groupEnd();
  }
}

// Export singleton instance
export const perfMonitor = new PerformanceMonitor();

/**
 * React Hook for measuring component render time
 */
export function usePerformanceMonitor(componentName: string) {
  if (typeof window === "undefined") return;

  React.useEffect(() => {
    const startTime = performance.now();
    return () => {
      const duration = performance.now() - startTime;
      if (duration > 50) {
        console.warn(
          `[PERF] Component ${componentName} render took ${duration.toFixed(2)}ms`,
        );
      }
    };
  }, [componentName]);
}

/**
 * Measure async operations
 */
export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>,
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    console.log(`[PERF] ${name}: ${duration.toFixed(2)}ms`);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    console.error(
      `[PERF] ${name} failed after ${duration.toFixed(2)}ms:`,
      error,
    );
    throw error;
  }
}

/**
 * Measure synchronous operations
 */
export function measureSync<T>(name: string, fn: () => T): T {
  const start = performance.now();
  try {
    const result = fn();
    const duration = performance.now() - start;
    if (duration > 10) {
      console.warn(`[PERF] ${name}: ${duration.toFixed(2)}ms`);
    }
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    console.error(
      `[PERF] ${name} failed after ${duration.toFixed(2)}ms:`,
      error,
    );
    throw error;
  }
}

// Export helper for use in development
if (typeof window !== "undefined") {
  (window as any).__PERF__ = perfMonitor;
}
