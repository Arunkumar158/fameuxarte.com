import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "oqslvwynlppuacdrhlxl.supabase.co" },
      { protocol: "https", hostname: "yexjmqhffxukzomkblqj.supabase.co" },
    ],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@": path.resolve(process.cwd(), "src"),
      "react-router-dom": path.resolve(process.cwd(), "src/lib/router-compat.tsx"),
    };
    return config;
  },
};

export default nextConfig;
