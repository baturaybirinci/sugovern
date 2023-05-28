/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}
module.exports = {
  nextConfig,
  serverRuntimeConfig: {
    PROJECT_ROOT: __dirname,
  },
};

