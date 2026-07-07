import type { BeforeEach } from 'storybook/internal/types';
import { once } from 'storybook/internal/client-logger';

import { PARAM_KEY } from './constants';

/**
 * Query parameters for a story.
 *
 * Values can be provided as a query string (`'foo=bar&baz=2'`) or as an object. Object values are
 * stringified. Setting a key to `null` (or `undefined`) removes the parameter from the URL instead,
 * which is useful to clear a parameter inherited from meta or preview-level parameters. Prefer
 * `null` for overrides: `undefined` values are dropped when Storybook merges parameters, so they
 * cannot override a value set at another level.
 */
export type QueryParams = string | Record<string, string | number | boolean | null | undefined>;

/**
 * Query parameters Storybook itself relies on in the preview URL. Overriding or deleting them
 * would break story selection, args and globals syncing, so they are never touched. Storybook
 * exports no constant for these; the list mirrors what the preview runtime reads from the URL
 * (`getSelectionSpecifierFromPath` in Storybook's UrlStore plus the preview runtime flags).
 */
const STORYBOOK_INTERNAL_PARAMS = new Set([
  'path',
  'id',
  'viewMode',
  'args',
  'globals',
  'refId',
  'instrument',
  'navigator',
  '__SPECIAL_TEST_PARAMETER__',
]);

/**
 * The pristine (pre-addon) state of every query parameter currently modified by at least one
 * mounted story, as the raw `key=value` segments found in the URL before the first modification.
 * Reference counting makes cleanup order-independent when several stories are mounted at once
 * (e.g. on a docs page): only the last story to release a key restores it.
 */
const pristineSegments = new Map<string, { segments: string[]; refCount: number }>();

/** Splits a search string into its raw `key=value` segments, without decoding them. */
const toSegments = (search: string): string[] =>
  search
    .replace(/^\?/, '')
    .split('&')
    .filter((segment) => segment !== '');

/** Decodes the parameter name of a raw `key=value` segment. */
const keyOfSegment = (segment: string): string => {
  const equals = segment.indexOf('=');
  const rawKey = equals === -1 ? segment : segment.slice(0, equals);
  const formDecodedKey = rawKey.replace(/\+/g, ' ');
  try {
    return decodeURIComponent(formDecodedKey);
  } catch {
    return formDecodedKey;
  }
};

/**
 * Resolves the effective value of each requested parameter: strings are parsed as query strings,
 * duplicate keys resolve to the last value, `null`/`undefined` mean "remove the parameter", and
 * parameters Storybook uses internally are dropped with a warning.
 */
const resolveParams = (parameters: QueryParams): Map<string, string | null> => {
  const entries =
    typeof parameters === 'string' ? Array.from(new URLSearchParams(parameters).entries()) : Object.entries(parameters);

  const values = new Map<string, string | null>();
  for (const [key, value] of entries) {
    if (STORYBOOK_INTERNAL_PARAMS.has(key)) {
      once.warn(
        `@storybook/addon-queryparams: ignoring the "${key}" query parameter because it is used internally by Storybook.`,
      );
      continue;
    }
    values.set(key, value === null || value === undefined ? null : String(value));
  }

  return values;
};

/** Replaces the URL's search string, leaving the path and hash untouched. */
const replaceSearch = (segments: string[]): void => {
  const { location, history } = window;
  const search = segments.length > 0 ? `?${segments.join('&')}` : '';
  if (search !== location.search) {
    history.replaceState(history.state, '', `${location.pathname}${search}${location.hash}`);
  }
};

/**
 * Applies the story's `query` parameters to the URL before the story renders, and restores the
 * previous URL state when navigating away from the story. Only the raw segments belonging to the
 * parameters named by the story are modified, so the encoding and multiplicity of every other
 * query parameter are preserved exactly. Running as a `beforeEach` hook (rather than a decorator)
 * makes the addon work in portable stories, e.g. when running stories with the Vitest addon.
 */
export const beforeEach: BeforeEach = ({ parameters }) => {
  const queryParams: QueryParams | undefined = parameters?.[PARAM_KEY];
  if (!queryParams) {
    return;
  }

  // In DOM-less runtimes (e.g. portable stories in a node environment) there is no URL to mock.
  if (typeof window === 'undefined') {
    return;
  }

  const values = resolveParams(queryParams);
  if (values.size === 0) {
    return;
  }

  const segments = toSegments(window.location.search);
  for (const key of values.keys()) {
    const pristine = pristineSegments.get(key) ?? {
      segments: segments.filter((segment) => keyOfSegment(segment) === key),
      refCount: 0,
    };
    pristine.refCount += 1;
    pristineSegments.set(key, pristine);
  }

  replaceSearch([
    ...segments.filter((segment) => !values.has(keyOfSegment(segment))),
    ...Array.from(values.entries())
      .filter((entry): entry is [string, string] => entry[1] !== null)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`),
  ]);

  let cleanedUp = false;

  return () => {
    if (cleanedUp) {
      return;
    }
    cleanedUp = true;

    const restored: string[] = [];
    for (const key of values.keys()) {
      const pristine = pristineSegments.get(key);
      if (!pristine) {
        continue;
      }
      pristine.refCount -= 1;
      if (pristine.refCount <= 0) {
        pristineSegments.delete(key);
        restored.push(...pristine.segments);
      }
    }

    const releasedKeys = new Set(restored.map(keyOfSegment));
    const currentSegments = toSegments(window.location.search).filter((segment) => {
      const key = keyOfSegment(segment);
      return !releasedKeys.has(key) && !(values.has(key) && !pristineSegments.has(key));
    });
    replaceSearch([...currentSegments, ...restored]);
  };
};
