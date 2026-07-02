/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: __dirname,
  output: "standalone",   // enables Docker-optimised build
};

module.exports = nextConfig;
