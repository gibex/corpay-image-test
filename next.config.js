const { nanoid } = require('nanoid');
const crypto = require('crypto');

const getCSP = () => {
  const hash = crypto.createHash('sha256');

  return process.env.VERCEL_ENV === 'production' ||
    process.env.VERCEL_ENV === 'preview'
    ? `default-src 'self'; style-src vercel.app *.vercel.app payments.corpay.com graphql.contentful.com cdn.contentful.com; img-src https://images.ctfassets.net; frame-src https://319-HFX-032.mktoweb.com; script-src 'sha256-${hash.digest(
        'base64'
      )}' 'self' 'unsafe-inline'`
    : '';
};
const securityHeaders = [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'Referrer-Policy',
    value: 'same-origin',
  },
  // {
  //   key: 'Content-Security-Policy',
  //   value: getCSP(),
  // },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block;',
  },
];

module.exports = {
  async headers() {
    return [
      {
        // Apply these headers to all routes in your application.
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  reactStrictMode: true,
  images: {
    domains: ['images.ctfassets.net'],
  },
  // swcMinify: true,
};
