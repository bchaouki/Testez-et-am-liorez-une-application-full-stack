import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

setupZoneTestEnv();

/* global mocks for jsdom */
const mock = () => {
  let storage: { [key: string]: string } = {};
  return {
    getItem: (key: string) => (key in storage ? storage[key] : null),
    setItem: (key: string, value: string) => (storage[key] = value || ''),
    removeItem: (key: string) => delete storage[key],
    clear: () => (storage = {}),
  };
};

Object.defineProperty(window, 'localStorage', { value: mock() });
Object.defineProperty(window, 'sessionStorage', { value: mock() });
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ['-webkit-appearance'],
});

Object.defineProperty(document.body.style, 'transform', {
  value: () => {
    return {
      enumerable: true,
      configurable: true,
    };
  },
});

/* jsdom cannot parse the CSS @layer rules shipped by Angular CDK overlays: silence that noise only */
const originalConsoleError = console.error;
console.error = (...args: unknown[]) => {
  const first = args[0] as { message?: string } | string | undefined;
  const message = typeof first === 'string' ? first : first?.message;
  if (message?.includes('Could not parse CSS stylesheet')) {
    return;
  }
  originalConsoleError(...args);
};

/* output shorter and more meaningful Zone error stack traces */
// Error.stackTraceLimit = 2;
