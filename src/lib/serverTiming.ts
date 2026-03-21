type TimingMetric = {
  name: string;
  durationMs: number;
  description?: string;
};

function toSafeDuration(durationMs: number) {
  if (!Number.isFinite(durationMs) || durationMs < 0) {
    return 0;
  }
  return Math.round(durationMs * 100) / 100;
}

export function buildServerTimingHeader(metrics: TimingMetric[]) {
  return metrics
    .map((metric) => {
      const dur = toSafeDuration(metric.durationMs);
      const description = metric.description
        ? `;desc="${metric.description.replace(/\"/g, "")}"`
        : "";
      return `${metric.name};dur=${dur}${description}`;
    })
    .join(", ");
}

export function buildTimingResponseHeaders(
  metrics: TimingMetric[],
  additionalHeaders?: Record<string, string>,
) {
  const total = metrics.find((metric) => metric.name === "total")?.durationMs;

  return {
    ...(additionalHeaders || {}),
    "Server-Timing": buildServerTimingHeader(metrics),
    "X-Response-Time-Ms": String(toSafeDuration(total ?? 0)),
  };
}
