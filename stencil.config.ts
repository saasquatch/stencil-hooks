import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'stencil-hooks',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'dist-custom-elements-bundle',
    }
  ],
};
