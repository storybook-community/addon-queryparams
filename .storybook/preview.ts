import addonDocs from '@storybook/addon-docs';
import { definePreview } from '@storybook/react-vite';
import addonQueryParams from '../dist/index.js';

export default definePreview({
  addons: [addonDocs(), addonQueryParams()],
});
