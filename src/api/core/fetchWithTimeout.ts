export class ApiTimeoutError extends Error {
  constructor(message = "Yêu cầu hết thời gian chờ") {
    super(message);
    this.name = "ApiTimeoutError";
  }
}

export async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout = 10000,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } catch (error) {
    // whatwg-fetch throws DOMException("AbortError") when request is aborted.
    // Normalize it so upper layers don't surface uncaught AbortError noise.
    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiTimeoutError(`Yêu cầu quá ${timeout}ms và đã bị hủy`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
