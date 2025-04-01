/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/dstack/api/:path*',
        destination: 'https://proof.t16z.com/api/:path*',
      },
    ];
  },
};

export default nextConfig;
