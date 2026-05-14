import { logger } from './logger';

export function logApi<T extends (...args: any[]) => Promise<any>>(
  tag: string,
  name: string,
  fn: T,
): T {
  return ((...args: any[]) => {
    return logger.timer(tag, name, () => fn(...args));
  }) as T;
}
