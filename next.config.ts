import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow images from OpenAI's DALL-E API and Wasabi S3 storage
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'oaidalleapiprodscus.blob.core.windows.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's3.us-east-2.wasabisys.com',
        pathname: '/**',
      }
    ],
    // Allow local images in the uploads directory
    unoptimized: false,
  },
};

export default nextConfig;
