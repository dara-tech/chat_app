import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      "lh3.googleusercontent.com", // Add Google User Image domain
      "avatars.githubusercontent.com", // Add GitHub domain for raw files
      "res.cloudinary.com", // Add Cloudinary domain if using Cloudinary
      // Add other domains as necessary
    ],
  },
};

export default nextConfig;
