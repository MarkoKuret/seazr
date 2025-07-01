const runtimeCaching = require('next-pwa/cache');
const withPWA = require('next-pwa')({
  pwa: {
    dest: 'public',
    register: true,
    skipWaitings: true,
    runtimeCaching,
    disabled: process.env.NODE_ENV === 'development',
    sw: 'sw.js',
  },
});

const nextConfig = {
  reactStrictMode: true,
  i18n: {
    locales: ['pt', 'en'],
    defaultLocale: 'pt',
  },
  react: {
    useSuspense: true,
  },
  swcMinify: true,
};

module.exports = [nextConfig, withPWA];
