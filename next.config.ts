import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'bteuugseyhiatphyjfxr.supabase.co', // Domain Supabase Anda
        port: '',
        pathname: '/**', // Izinkan semua path
      },
    ],
  },
};

export default nextConfig;