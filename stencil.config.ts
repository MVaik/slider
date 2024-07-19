import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'slider',
  outputTargets: [
    {
      type: 'www',
      serviceWorker: null, // disable service workers
    },
  ],
  testing: {
    browserHeadless: 'new',
  },
};
