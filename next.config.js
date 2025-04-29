/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.cresol.com.br',
      },
    ],
  },
};

module.exports = nextConfig;