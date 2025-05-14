/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.firebaseio.com https://www.googletagmanager.com https://va.vercel-scripts.com https://*.vercel-scripts.com https://apis.google.com https://*.googleapis.com https://accounts.google.com https://www.gstatic.com; connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://*.gstatic.com; frame-src 'self' https://accounts.google.com;"
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig; 