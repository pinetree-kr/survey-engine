/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Turbopack은 --turbo 플래그로 활성화됨
  webpack: (config) => {
    // 버전 번호가 포함된 import를 처리하기 위한 alias 설정
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    return config;
  },
};

export default nextConfig;

