import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // firebase-admin's transitive deps (jwks-rsa -> jose) mix ESM/CJS in a way
  // Turbopack fails to bundle correctly; keep the whole chain as native requires.
  serverExternalPackages: ["firebase-admin", "jwks-rsa", "jose", "google-auth-library"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
