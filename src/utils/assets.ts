/**
 * Assets 유틸리티 함수
 * 
 * public 폴더의 정적 파일 경로를 관리하는 유틸리티
 */

/**
 * 아이콘 경로 생성
 * @param filename 아이콘 파일명 (예: "logo.svg")
 * @returns 아이콘 경로 (예: "/icons/logo.svg")
 */
export function getIconPath(filename: string): string {
  return `/icons/${filename}`;
}

/**
 * 이미지 경로 생성
 * @param filename 이미지 파일명 (예: "logo.png")
 * @returns 이미지 경로 (예: "/images/logo.png")
 */
export function getImagePath(filename: string): string {
  return `/images/${filename}`;
}

/**
 * 파비콘 경로
 */
export const FAVICON_PATH = "/icons/favicon.ico";

/**
 * PWA 아이콘 경로
 */
export const PWA_ICONS = {
  icon192: "/icons/icon-192.png",
  icon512: "/icons/icon-512.png",
  appleTouch: "/icons/apple-touch-icon.png",
} as const;

/**
 * 매니페스트 파일 경로
 */
export const MANIFEST_PATH = "/manifest.json";

