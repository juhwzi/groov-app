import type { NextConfig } from "next";
const nextConfig: NextConfig = { typedRoutes: true, images: { remotePatterns: [
  { protocol: "https", hostname: "i.scdn.co" },
  { protocol: "https", hostname: "images.unsplash.com" },
  { protocol: "https", hostname: "coverartarchive.org" },
  { protocol: "https", hostname: "lastfm.freetls.fastly.net" },
  { protocol: "https", hostname: "cdn.discordapp.com" }
] } };
export default nextConfig;
