const BATCH_YEAR_REGEX = /^(\d{4})-(\d{4})$/;

export function normalizeBatchYear(value: unknown) {
  const raw = String(value ?? "").trim();
  if (!raw) {
    return "";
  }

  const compact = raw.replace(/\s*-\s*/, "-");
  return compact;
}

export function isValidBatchYear(value: unknown) {
  const normalized = normalizeBatchYear(value);
  const match = normalized.match(BATCH_YEAR_REGEX);
  if (!match) {
    return false;
  }

  const start = Number(match[1]);
  const end = Number(match[2]);
  return end - start === 4;
}

export function getStandardBatchYearOptions(
  currentYear = new Date().getFullYear(),
) {
  const options: string[] = [];
  for (let offset = -10; offset <= 10; offset += 1) {
    const start = currentYear + offset;
    options.push(`${start}-${start + 4}`);
  }
  return options;
}
