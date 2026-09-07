import { once } from 'storybook/internal/client-logger';
import type { CleanupCallback, StoryContext } from 'storybook/internal/types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as preview from './preview';
import type { QueryParams } from './preview';

// The URL configured for jsdom in vite.config.ts.
const BASE_URL = window.location.href;

const currentParams = () => new URLSearchParams(window.location.search);

let pendingCleanups: CleanupCallback[] = [];

const runHook = (query?: QueryParams) => {
  const cleanup = preview.beforeEach({ parameters: { query } } as unknown as StoryContext) as
    CleanupCallback | undefined;
  if (cleanup) {
    pendingCleanups.push(cleanup);
  }
  return cleanup;
};

beforeEach(() => {
  history.replaceState(null, '', BASE_URL);
  // Reset the deduplication memory of once.warn, so warning tests survive retries.
  once.clear();
});

afterEach(() => {
  // Release any application a test did not clean up itself, so the module-level pristine state
  // never leaks between tests. Cleanups are idempotent, so double invocation is safe.
  for (const cleanup of pendingCleanups.reverse()) {
    cleanup();
  }
  pendingCleanups = [];
});

describe('beforeEach', () => {
  it('adds the query parameters to the URL before the story renders', () => {
    runHook({ mock: 'Hello world!' });

    expect(currentParams().get('mock')).toBe('Hello world!');
  });

  it('keeps unrelated query parameters intact', () => {
    history.replaceState(null, '', `${BASE_URL}&existing=1`);

    runHook({ mock: 'Hello world!' });

    const params = currentParams();
    expect(params.get('existing')).toBe('1');
    expect(params.get('id')).toBe('example-params--playground');
    expect(params.get('viewMode')).toBe('story');
  });

  it('preserves the raw encoding of query parameters it does not touch', () => {
    history.replaceState(null, '', `${BASE_URL}&args=label:Hi%20there&flag&msg=a%20b`);

    const cleanup = runHook({ mock: '1' });

    expect(window.location.search).toContain('args=label:Hi%20there');
    expect(window.location.search).toContain('flag');
    expect(window.location.search).toContain('msg=a%20b');
    expect(currentParams().get('mock')).toBe('1');

    cleanup?.();

    expect(window.location.href).toBe(`${BASE_URL}&args=label:Hi%20there&flag&msg=a%20b`);
  });

  it('preserves the URL hash', () => {
    history.replaceState(null, '', `${BASE_URL}#some-anchor`);

    const cleanup = runHook({ mock: '1' });

    expect(window.location.hash).toBe('#some-anchor');
    expect(currentParams().get('mock')).toBe('1');

    cleanup?.();

    expect(window.location.href).toBe(`${BASE_URL}#some-anchor`);
  });

  it('accepts parameters formatted as a query string', () => {
    runHook('foo=bar&baz=2');

    const params = currentParams();
    expect(params.get('foo')).toBe('bar');
    expect(params.get('baz')).toBe('2');
  });

  it('uses the last value when a query string repeats a key', () => {
    runHook('foo=first&foo=last');

    expect(currentParams().getAll('foo')).toEqual(['last']);
  });

  it('stringifies number and boolean values', () => {
    runHook({ page: 2, active: false });

    const params = currentParams();
    expect(params.get('page')).toBe('2');
    expect(params.get('active')).toBe('false');
  });

  it('removes parameters set to null instead of serializing them', () => {
    history.replaceState(null, '', `${BASE_URL}&name=John`);

    runHook({ name: null });

    expect(currentParams().has('name')).toBe(false);
    expect(window.location.search).not.toContain('null');
  });

  it('removes parameters set to undefined instead of serializing them', () => {
    history.replaceState(null, '', `${BASE_URL}&name=John`);

    runHook({ name: undefined });

    expect(currentParams().has('name')).toBe(false);
    expect(window.location.search).not.toContain('undefined');
  });

  it('does nothing for null or undefined values when the parameter is absent', () => {
    runHook({ name: null, nickname: undefined });

    const params = currentParams();
    expect(params.has('name')).toBe(false);
    expect(params.has('nickname')).toBe(false);
  });

  it('returns no cleanup and leaves the URL alone when the story has no query parameters', () => {
    const cleanup = runHook(undefined);

    expect(cleanup).toBeUndefined();
    expect(window.location.href).toBe(BASE_URL);
  });

  it('does not rewrite the URL when the requested parameters are already applied', () => {
    history.replaceState(null, '', `${BASE_URL}&mock=same`);
    const replaceState = vi.spyOn(window.history, 'replaceState');

    try {
      runHook({ mock: 'same' });

      expect(replaceState).not.toHaveBeenCalled();
    } finally {
      replaceState.mockRestore();
    }
  });

  it('ignores query parameters used internally by Storybook and warns about them', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    try {
      const cleanup = runHook({
        path: '/files',
        id: 'my-app-id',
        viewMode: null,
        args: 'a:1',
        globals: undefined,
        refId: 'ref',
        instrument: true,
        navigator: 'custom',
      });

      const params = currentParams();
      expect(params.get('id')).toBe('example-params--playground');
      expect(params.get('viewMode')).toBe('story');
      expect(params.has('path')).toBe(false);
      expect(params.has('args')).toBe(false);
      expect(params.has('globals')).toBe(false);
      expect(params.has('refId')).toBe(false);
      expect(params.has('instrument')).toBe(false);
      expect(params.has('navigator')).toBe(false);
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('"path"'));

      // Nothing was applied, so there is nothing to clean up.
      expect(cleanup).toBeUndefined();
    } finally {
      warn.mockRestore();
    }
  });

  it('only warns once about the same Storybook-internal parameter', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    try {
      runHook({ __SPECIAL_TEST_PARAMETER__: 'a' });
      runHook({ __SPECIAL_TEST_PARAMETER__: 'a' });

      const internalWarnings = warn.mock.calls.filter(([message]) =>
        String(message).includes('__SPECIAL_TEST_PARAMETER__'),
      );
      expect(internalWarnings).toHaveLength(1);
    } finally {
      warn.mockRestore();
    }
  });

  describe('cleanup', () => {
    it('removes parameters that were added', () => {
      const cleanup = runHook({ mock: 'Hello world!' });

      cleanup?.();

      expect(currentParams().has('mock')).toBe(false);
      expect(window.location.href).toBe(BASE_URL);
    });

    it('restores parameters that were overridden or removed', () => {
      history.replaceState(null, '', `${BASE_URL}&color=red&name=John`);

      const cleanup = runHook({ color: 'blue', name: null });

      const params = currentParams();
      expect(params.get('color')).toBe('blue');
      expect(params.has('name')).toBe(false);

      cleanup?.();

      const restored = currentParams();
      expect(restored.get('color')).toBe('red');
      expect(restored.get('name')).toBe('John');
    });

    it('restores every value of a multi-valued query parameter', () => {
      history.replaceState(null, '', `${BASE_URL}&tag=a&tag=b`);

      const cleanup = runHook({ tag: 'mocked' });

      expect(currentParams().getAll('tag')).toEqual(['mocked']);

      cleanup?.();

      expect(currentParams().getAll('tag')).toEqual(['a', 'b']);
    });

    it('leaves parameters updated by Storybook while the story was shown untouched', () => {
      const cleanup = runHook({ mock: 'Hello world!' });

      // Storybook syncs story selection and args to the URL while a story is shown, e.g. when
      // navigating to the next story. The cleanup must not undo those changes.
      const url = new URL(window.location.href);
      url.searchParams.set('id', 'example-params--other');
      url.searchParams.set('args', 'label:Hi');
      history.replaceState(null, '', url.toString());

      cleanup?.();

      const params = currentParams();
      expect(params.get('id')).toBe('example-params--other');
      expect(params.get('args')).toBe('label:Hi');
      expect(params.has('mock')).toBe(false);
    });

    it('prevents parameters from leaking from one story to the next', () => {
      const cleanupA = runHook({ mock: 'from story A' });
      cleanupA?.();

      const cleanupB = runHook({ other: 'from story B' });

      const params = currentParams();
      expect(params.has('mock')).toBe(false);
      expect(params.get('other')).toBe('from story B');

      cleanupB?.();

      expect(window.location.href).toBe(BASE_URL);
    });

    it('restores the URL when several mounted stories touch the same parameter, in mount order', () => {
      // On a docs page, multiple stories mount at once and share the document URL.
      const cleanupA = runHook({ mock: 'from story A' });
      const cleanupB = runHook({ mock: 'from story B' });

      expect(currentParams().get('mock')).toBe('from story B');

      cleanupA?.();
      cleanupB?.();

      expect(currentParams().has('mock')).toBe(false);
      expect(window.location.href).toBe(BASE_URL);
    });

    it('restores the URL when several mounted stories touch the same parameter, in reverse order', () => {
      history.replaceState(null, '', `${BASE_URL}&mock=original`);

      const cleanupA = runHook({ mock: 'from story A' });
      const cleanupB = runHook({ mock: null });

      expect(currentParams().has('mock')).toBe(false);

      cleanupB?.();
      cleanupA?.();

      expect(currentParams().get('mock')).toBe('original');
    });

    it('is idempotent, so a cleanup invoked twice does not affect other mounted stories', () => {
      history.replaceState(null, '', `${BASE_URL}&mock=original`);

      const cleanupA = runHook({ mock: 'from story A' });
      const cleanupB = runHook({ mock: 'from story B' });

      cleanupA?.();
      cleanupA?.();

      // Story B is still mounted: its value must survive story A's double cleanup.
      expect(currentParams().get('mock')).toBe('from story B');

      cleanupB?.();

      expect(currentParams().get('mock')).toBe('original');
    });

    it('restores parameters applied from a query string, including keys that need decoding', () => {
      const cleanup = runHook('a+b=1&msg=a%20b');

      const params = currentParams();
      expect(params.get('a b')).toBe('1');
      expect(params.get('msg')).toBe('a b');

      cleanup?.();

      expect(window.location.href).toBe(BASE_URL);
    });

    it('restores overridden parameters without dropping the URL hash', () => {
      history.replaceState(null, '', `${BASE_URL}&color=red#anchor`);

      const cleanup = runHook({ color: 'blue' });

      cleanup?.();

      expect(currentParams().get('color')).toBe('red');
      expect(window.location.hash).toBe('#anchor');
    });

    it('overrides and restores parameters whose raw key mixes "+" with a malformed percent-sequence', () => {
      history.replaceState(null, '', `${BASE_URL}&a+%zz=old`);

      const cleanup = runHook({ 'a %zz': 'new' });

      const params = currentParams();
      expect(params.getAll('a %zz')).toEqual(['new']);

      cleanup?.();

      expect(window.location.href).toBe(`${BASE_URL}&a+%zz=old`);
    });

    it('does not confuse a percent-encoded spelling of a reserved key with the real one', () => {
      const cleanup = runHook({ '%69d': 'x' });

      // The '%69d' parameter is applied double-encoded and Storybook's own 'id' is untouched.
      const params = currentParams();
      expect(params.get('id')).toBe('example-params--playground');
      expect(params.get('%69d')).toBe('x');

      cleanup?.();

      expect(window.location.href).toBe(BASE_URL);
    });
  });
});
