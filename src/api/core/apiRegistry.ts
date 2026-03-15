import { apiConfigs } from "../configs";
import { ApiConfig } from "./types";

class ApiRegistry {
  private registry: Record<string, ApiConfig> = {};

  constructor() {
    this.registry = { ...apiConfigs };
  }

  get(apiName: string): ApiConfig {
    const config = this.registry[apiName];

    if (!config) {
      throw new Error(`Không tìm thấy API "${apiName}" trong apiRegistry`);
    }

    return config;
  }

  register(apiName: string, config: ApiConfig) {
    this.registry[apiName] = config;
  }

  has(apiName: string): boolean {
    return !!this.registry[apiName];
  }

  getAll(): Record<string, ApiConfig> {
    return this.registry;
  }
}

export const apiRegistry = new ApiRegistry();
