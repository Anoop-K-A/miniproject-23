const invalidFileNameChars = /[\\/:*?"<>|]+/g;

export function sanitizeFileName(rawName: string, fallback: string): string {
  const trimmed = rawName.trim();
  const baseName = trimmed.length > 0 ? trimmed : fallback;
  const sanitized = baseName
    .replace(invalidFileNameChars, "-")
    .replace(/\s+/g, " ");
  return sanitized.length > 0 ? sanitized : fallback;
}

export function downloadFromDataUrl(dataUrl: string, fileName: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadTextFile(
  content: string,
  fileName: string,
  mimeType = "text/plain",
) {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export function downloadJsonFile(data: unknown, fileName: string) {
  const content = JSON.stringify(data, null, 2);
  downloadTextFile(content, fileName, "application/json");
}
