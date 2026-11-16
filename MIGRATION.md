<h1>Migration</h1>

- [From version 10.x to 11.0.0](#from-version-10x-to-1100)
  - [Support storybook 11.x](#support-storybook-11x)
- [From version 9.x to 10.0.0](#from-version-9x-to-1000)
  - [Support storybook 10.x and switch to ESM-only](#support-storybook-10x-and-switch-to-esm-only)
- [From version 8.x to 9.0.0](#from-version-8x-to-900)
  - [Support storybook 9.x](#support-storybook-9x)
- [From version 7.x to 8.0.0](#from-version-7x-to-800)
  - [`withQuery` decorator removed](#withquery-decorator-removed)

## From version 10.x to 11.0.0

### Support storybook 11.x

Storybook v11 is now supported. Following Storybook's recommendation to release a new major version of an addon alongside each major version of Storybook, this version declares a peer dependency on `storybook@^11.0.0` and is not available for earlier versions of Storybook. Keep using version 10.x of the addon with Storybook 10.

Storybook 11 also raises its minimum requirements, notably Node.js 22.12 and TypeScript 5.9. Follow the [Storybook 11 migration guide](https://storybook.js.org/docs/11/releases/migration-guide) to upgrade your project first.

The addon's API is unchanged: the `query` parameter works exactly as before. Note that in Storybook 11, [CSF 4](https://storybook.js.org/docs/11/writing-stories/csf) is the default story format, so make sure the addon is registered in your `.storybook/preview.ts` file as documented in the README to get type-safe `query` parameters.

## From version 9.x to 10.0.0

### Support storybook 10.x and switch to ESM-only

Storybook v10 is now supported. The addon also becomes an ESM-only package.
Due to these changes, it is not available for versions earlier than v10.

## From version 8.x to 9.0.0

### Support storybook 9.x

Storybook v9 is now supported.
However, due to changes in the internal package, it is not available for versions earlier than v9.

## From version 7.x to 8.0.0

### `withQuery` decorator removed

The `withQuery` decorator is not necessary anymore and therefore its export was removed from the package. It's an internally defined decorator which is automatically applied to every story you have. Please remove from your stories/preview files:

```diff
import React from "react";
import { Button } from "../Button";
-import { withQuery } from "@storybook/addon-queryparams";

export default {
  title: "Button",
  component: Button,
-  decorators: [withQuery],
  parameters: {
    query: {
      greeting: "Hello world!",
    },
  },
};
```
