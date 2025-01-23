/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  async rewrites() {
    return [
      {
        source: '/meeting/:meeting_id',
        destination: '/meeting/:meeting_id',
      },
      {
        source: '/:any*',
        destination: '/dashboard',
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.tuft.in',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        
      },
    ],
  },
};

export default nextConfig;
