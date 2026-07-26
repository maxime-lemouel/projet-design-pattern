import { VolatileStorage } from './strategy.ts';
import type { StorageStrategy } from './strategy.ts';

export class AppConfig {
  private static instance: AppConfig | undefined;
  private readonly config: Record<string, string> = {};

  private constructor() {}

  static getInstance(): AppConfig {
    if (!AppConfig.instance) {
      AppConfig.instance = new AppConfig();
    }
    return AppConfig.instance;
  }

  set(key: string, value: string): void {
    this.config[key] = value;
  }

  get(key: string): string | undefined {
    return this.config[key];
  }
}

export class AppStore {
  private static instance: AppStore | undefined;
  private readonly state: Record<string, unknown> = {};

  private constructor(private strategy: StorageStrategy) {}

  static getInstance(): AppStore {
    if (!AppStore.instance) {
      AppStore.instance = new AppStore(new VolatileStorage());
    }
    return AppStore.instance;
  }

  setStrategy(strategy: StorageStrategy): void {
    this.strategy = strategy;
  }

  getState<Value>(key: string): Value | undefined {
    return this.state[key] as Value | undefined;
  }

  setState(key: string, value: unknown): void {
    this.state[key] = value;
    void this.strategy.set(key, value);
  }

  async restoreState<Value>(key: string): Promise<Value | undefined> {
    const value = await this.strategy.get<Value>(key);
    if (value !== undefined) {
      this.state[key] = value;
    }
    return value;
  }
}
