import type { DecoratorFunction } from 'storybook/internal/types';
import { useParameter } from 'storybook/preview-api';

import { PARAM_KEY } from './constants';

export const withQuery: DecoratorFunction = (StoryFn) => {
  const parameters = useParameter(PARAM_KEY, null);
  const { location } = document;
  const currentQuery = new URLSearchParams(location.search);

  if (parameters) {
    const additionalQuery = typeof parameters === 'string' ? new URLSearchParams(parameters) : parameters;

    const newLocation = new URL(document.location.href);
    newLocation.search = new URLSearchParams({
      ...currentQuery,
      ...additionalQuery,
    }).toString();

    history.replaceState({}, document.title, newLocation.toString());
  }

  return StoryFn();
};

export const decorators = [withQuery];
