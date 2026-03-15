export function buildUrl(
  baseUrl: string,
  endpoint: string,
  pathParams?: Record<string, string | number>,
  query?: Record<string, any>,
): string {
  let finalEndpoint = endpoint;

  if (pathParams) {
    for (const [key, value] of Object.entries(pathParams)) {
      finalEndpoint = finalEndpoint.replace(
        `{${key}}`,
        encodeURIComponent(String(value)),
      );
    }
  }

  const url = new URL(finalEndpoint, baseUrl);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    }
  }

  return url.toString();
}
