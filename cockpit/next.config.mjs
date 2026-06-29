/**
 * WEAVE Owner Cockpit — Next.js config.
 * Deliberately minimal. This app is run with `next dev` only this sprint
 * (no build/deploy — that would cross the production-deploy gate). No remote
 * images, no rewrites to external hosts, no telemetry-driven network calls.
 */
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The cockpit makes no outbound network calls; nothing to configure here.
};

export default nextConfig;
