# @storybook/addon-queryparams

> [!NOTE]
> This addon is now community-maintained. It was previously maintained by the Storybook team.

This Storybook addon can be helpful if your components need special query parameters to work the way you want them to. It allows you to mock query params per story so that you can easily reproduce different states of your component.

## Getting started

First, install the addon.

```sh
$ npx storybook@latest add @storybook/addon-queryparams
```

In your story, define the query parameters you want to mock via the `query` special parameter:

```tsx
// src/stories/Button.stories.tsx
import React from 'react';
import { Button } from '../Button';

export default {
  component: Button,
  parameters: {
    query: {
      // example of mocking ?greeting="Hello world!"
      greeting: 'Hello world!',
    },
  },
};

export const WithMockedSearch = {
  render: () => {
    const urlParams = new URLSearchParams(document.location.search);
    const mockedParam = urlParams.get('greeting');
    return <div>Mocked value: {mockedParam}</div>;
  },
};
```

The `query` parameter accepts either an object or a query string (`'greeting=Hello world!&page=2'`). Object values may be strings, numbers or booleans, which are stringified into the URL.

The query parameters are applied before the story renders, and the URL is restored to its previous state when you navigate away from the story, so parameters never leak from one story to the next.

### Clearing query parameters

Set a parameter to `null` to remove it from the URL instead of setting it. This is useful to clear a parameter that is defined at the meta or preview level:

```tsx
export const WithoutGreeting = {
  parameters: {
    query: {
      // removes ?greeting even if it is set at the meta level
      greeting: null,
    },
  },
};
```

> [!TIP]
> `undefined` values are treated like `null`, but prefer `null` for overrides: Storybook drops `undefined` values when merging parameters, so they cannot override a value defined at another level.

### Reserved query parameters

Storybook uses the `path`, `id`, `viewMode`, `args`, `globals`, `refId`, `instrument`, `navigator` and `__SPECIAL_TEST_PARAMETER__` query parameters internally in the preview URL. To avoid breaking story selection and args syncing, the addon ignores these keys and logs a warning if your stories try to set or clear them. All other query parameters are left exactly as they are, byte for byte.

### Usage with the Vitest addon

Query parameters are applied through a [`beforeEach` hook](https://storybook.js.org/docs/writing-stories/mocking-data-and-modules/mocking-modules#setting-up-and-cleaning-up), which also runs when stories are executed as portable stories, e.g. with the [Vitest addon](https://storybook.js.org/docs/writing-tests/integrations/vitest-addon). Play functions can therefore rely on the mocked query parameters in both Storybook and Vitest runs.

## CSF Next support

For CSF Next annotations, import the addon in your `preview.ts`:

```ts
// .storybook/preview.ts
import { definePreview } from '@storybook/your-framework';
import addonDocs from '@storybook/addon-docs';
import addonQueryParams from '@storybook/addon-queryparams';

export default definePreview({
  addons: [addonDocs(), addonQueryParams()],
});
```

## Credits

While this addon was part of the [Storybook monorepo](https://github.com/storybookjs/storybook), it received commits from the following authors:

> Andrew Lisowski,
> Brody McKee,
> Clément DUNGLER,
> Filipp Riabchun,
> Gaëtan Maisse,
> Gert Hengeveld,
> Jon Palmer,
> Lynn Chyi,
> Michael Shilman,
> Norbert de Langen,
> Paul Rosania,
> Renovate Bot,
> Tom Coleman,
> Varun Vachhar,
> Yann Braga
