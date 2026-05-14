type Level = 'debug' | 'info' | 'warn' | 'error';

const levels: Record<Level, number> = { debug: 0, info: 1, warn: 2, error: 3 };

const currentLevel: Level = import.meta.env.DEV ? 'debug' : 'warn';

function log(level: Level, tag: string, message: string, data?: unknown) {
  if (levels[level] < levels[currentLevel]) return;
  const prefix = `[${level.toUpperCase()}] [${tag}]`;
  const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
  fn(`${prefix} ${message}`, data ?? '');
}

function timer<T>(tag: string, label: string, fn: () => Promise<T>): Promise<T> {
  const start = performance.now();
  return fn()
    .then((result) => {
      log('info', tag, `${label} OK (${(performance.now() - start).toFixed(0)}ms)`);
      return result;
    })
    .catch((e) => {
      log('error', tag, `${label} FAILED (${(performance.now() - start).toFixed(0)}ms)`, e);
      throw e;
    });
}

export const logger = { debug: (t: string, m: string, d?: unknown) => log('debug', t, m, d), info: (t: string, m: string, d?: unknown) => log('info', t, m, d), warn: (t: string, m: string, d?: unknown) => log('warn', t, m, d), error: (t: string, m: string, d?: unknown) => log('error', t, m, d), timer };
