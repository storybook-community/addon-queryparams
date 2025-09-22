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

```ts
import React from "react";
import { Button } from "../Button";

export default {
  component: Button,
  parameters: {
    query: {
      // example of mocking ?greeting="Hello world!"
      greeting: "Hello world!",
    },
  },
};

export const WithMockedSearch = {
  render: () => {
    const urlParams = new URLSearchParams(document.location.search);
    const mockedParam = urlParams.get("greeting");
    return <div>Mocked value: {mockedParam}</div>;
  }
}
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
