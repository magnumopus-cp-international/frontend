export function tryParseJson<Result>(
  json: string | null | undefined,
  defaultValue: Result | null = null,
  log?: (message: string, error: any, json: string | null | undefined) => void
): Result | null {
  try {
    if (!json) return defaultValue;
    return JSON.parse(json);
  } catch (e) {
    log?.('Error parsing json', e, json);
    return defaultValue;
  }
}
