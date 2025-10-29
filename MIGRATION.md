<h1>Migration</h1>

- [From version 9.x to 10.0.0](#from-version-9x-to-1000)
  - [Support storybook 10.x and switch to ESM-only](#support-storybook-10x-and-switch-to-esm-only)
- [From version 8.x to 9.0.0](#from-version-8x-to-900)
  - [Support storybook 9.x](#support-storybook-9x)
- [From version 7.x to 8.0.0](#from-version-7x-to-800)
  - [`withQuery` decorator removed](#withquery-decorator-removed)

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
