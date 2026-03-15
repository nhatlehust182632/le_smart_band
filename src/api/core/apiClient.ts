import { logger } from "../../utils/logger";
import { apiRegistry } from "./apiRegistry";
import { buildUrl } from "./buildUrl";
import { fetchWithTimeout } from "./fetchWithTimeout";
import { CallApiOptions } from "./types";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function callApi(apiName: string, options: CallApiOptions = {}) {
  const config = apiRegistry.get(apiName);

  const mergedQuery = {
    ...(config.defaultQuery || {}),
    ...(options.query || {}),
  };

  const url = buildUrl(
    config.baseUrl,
    config.endpoint,
    options.pathParams,
    mergedQuery,
  );

  const headers: Record<string, string> = {
    ...(config.headers || {}),
    ...(options.headers || {}),
  };

  if (config.authType === "bearer") {
    const token = options.token || config.token;
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  if (config.authType === "apikey") {
    if (config.apiKeyHeader && config.apiKeyValue) {
      headers[config.apiKeyHeader] = config.apiKeyValue;
    }
  }

  const requestOptions: RequestInit = {
    method: config.method,
    headers,
  };

  if (
    config.method !== "GET" &&
    config.method !== "DELETE" &&
    options.body !== undefined
  ) {
    requestOptions.body = JSON.stringify(options.body);
  }

  const retries = config.retries ?? 0;
  const timeout = config.timeout ?? 10000;

  let lastError: any;

  logger.info("API Request", {
    apiName,
    method: config.method,
    url,
    query: mergedQuery,
    pathParams: options.pathParams,
  });

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const startTime = Date.now();

      const response = await fetchWithTimeout(url, requestOptions, timeout);

      const duration = Date.now() - startTime;
      const contentType = response.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

      logger.info("API Response", {
        apiName,
        status: response.status,
        duration: `${duration}ms`,
      });

      if (!response.ok) {
        throw new Error(
          `API ${apiName} lỗi: ${response.status} - ${JSON.stringify(data)}`,
        );
      }

      return config.transformResponse ? config.transformResponse(data) : data;
    } catch (error) {
      lastError = error;

      logger.error("API Error", {
        apiName,
        attempt: attempt + 1,
        retries: retries + 1,
        error,
      });

      if (attempt < retries) {
        logger.warn("API Retry", {
          apiName,
          nextAttempt: attempt + 2,
        });

        await sleep(1000 * (attempt + 1));
      }
    }
  }

  throw lastError;
}
