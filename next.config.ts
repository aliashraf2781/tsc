import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

function hostnamesFromEnv(...keys: string[]): string[] {
  const hosts = new Set<string>();
  for (const key of keys) {
    const value = process.env[key];
    if (!value) continue;
    try {
      hosts.add(new URL(value).hostname);
    } catch (e) {
      void e
    }
  }
  return [...hosts];
}

const imageHosts = [
  "dashboardtalent.talent-sc.de",
  ...hostnamesFromEnv("NEXT_PUBLIC_STORAGE_URL", "NEXT_PUBLIC_API_URL"),
];

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Job create wizard uploads images via Server Actions (default limit is 1 MB)
      bodySizeLimit: "10mb",
    },
  },
  images: {
    remotePatterns: imageHosts.map((hostname) => ({
      protocol: "https",
      hostname,
      pathname: "/**",
    })),
  },
};

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

export default withNextIntl(nextConfig);
