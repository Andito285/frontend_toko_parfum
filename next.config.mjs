/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  allowedDevOrigins: [
    'http://192.168.24.131:3000',
    'http://192.168.24.131',
    'http://localhost:3000',
    'http://localhost',
  ],
};

export default nextConfig;
