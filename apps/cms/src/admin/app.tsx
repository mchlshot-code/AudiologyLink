import type { StrapiApp } from '@strapi/strapi/admin';

export default {
  config: {
    auth: {
      logo: '/logo.png',
    },
    menu: {
      logo: '/logo.png',
    },
    head: {
      favicon: '/logo.png',
    },
    locales: [],
  },
  bootstrap(app: StrapiApp) {
    return app;
  },
};
