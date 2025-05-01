import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'iewigwjujeulneruccbb.supabase.co',
        pathname: '/storage/v1/object/public/menus-images/**',
      },
    ],
  },
};

export default nextConfig;
