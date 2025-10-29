import preview from '#.storybook/preview';
import React from 'react';

const meta = preview.meta({
  title: 'Example/Params',
  component: () => {
    const urlParams = new URLSearchParams(document.location.search);
    const mockedParam = urlParams.get('mock');
    return <div>Mocked value: {mockedParam}</div>;
  },
  parameters: {
    query: {
      mock: 'Hello world!',
    },
  },
});

export const Playground = meta.story({});
