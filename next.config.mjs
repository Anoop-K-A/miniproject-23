/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  swcMinify: true,
  compress: true,
  productionBrowserSourceMaps: false,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  turbopack: {
    resolveAlias: {
      "@": "./src",
    },
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-dialog",
      "@radix-ui/react-select",
      "@radix-ui/react-tabs",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-alert-dialog",
      "@radix-ui/react-avatar",
      "@radix-ui/react-badge",
      "@radix-ui/react-button",
      "@radix-ui/react-card",
      "@radix-ui/react-checkbox",
      "@radix-ui/react-input",
      "@radix-ui/react-label",
      "@radix-ui/react-scroll-area",
      "clsx",
      "class-variance-authority",
    ],
    optimizeCss: true,
    optimizeServerReact: true,
  },
};

export default nextConfig;
