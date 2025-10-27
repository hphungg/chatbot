import type { NextConfig } from "next"

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "lh3.googleusercontent.com",
            },
        ],
    },
    devIndicators: false,
    typescript: {
        ignoreBuildErrors: true,
    },
}

export default nextConfig
