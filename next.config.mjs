/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
    experimental: {
    serverExternalPackages: ['@prisma/client'],
  },
}
export default nextConfig



