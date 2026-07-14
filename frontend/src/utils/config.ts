export interface UserConfig {
  provider: 'deepseek' | 'openai' | 'qwen';
  apiKey: string;
}

const CONFIG_KEY = 'moyun_config';

export function getConfig(): UserConfig | null {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed.provider || !parsed.apiKey) return null;
    return parsed as UserConfig;
  } catch {
    return null;
  }
}

export function saveConfig(config: UserConfig): void {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

export function clearConfig(): void {
  localStorage.removeItem(CONFIG_KEY);
}

export function hasConfig(): boolean {
  return getConfig() !== null;
}
