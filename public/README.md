# Public Assets

이 폴더는 정적 파일(이미지, 아이콘, 폰트 등)을 저장하는 곳입니다.

## 폴더 구조

```
public/
├── icons/          # 아이콘 파일 (SVG, PNG, ICO 등)
│   ├── favicon.ico          # 파비콘 (필수)
│   ├── icon-192.png         # PWA 아이콘 192x192
│   ├── icon-512.png         # PWA 아이콘 512x512
│   └── apple-touch-icon.png # Apple 터치 아이콘 180x180
├── images/         # 이미지 파일 (PNG, JPG, GIF, WebP 등)
├── manifest.json   # PWA 매니페스트 파일
├── robots.txt      # 검색 엔진 크롤러 설정
└── sitemap.xml     # 사이트맵 (선택사항)
```

## Next.js에서 index.html이 필요 없는 이유

Next.js App Router를 사용하는 경우:
- **index.html 불필요**: `src/app/layout.tsx`가 HTML 구조를 담당합니다
- **public 폴더**: 정적 파일만 저장 (HTML 파일 불필요)
- **메타데이터**: `layout.tsx`의 `metadata` 객체로 설정
- **파비콘**: `public/icons/favicon.ico`에 배치하고 `layout.tsx`에서 참조

## 사용 방법

### Next.js에서 이미지 사용

```tsx
// Image 컴포넌트 사용 (권장 - 자동 최적화)
import Image from 'next/image';

<Image 
  src="/images/logo.png" 
  alt="로고" 
  width={200} 
  height={200} 
/>

// 일반 img 태그 사용
<img src="/images/logo.png" alt="로고" />
```

### 아이콘 사용

```tsx
// SVG 아이콘
<img src="/icons/logo.svg" alt="아이콘" />

// PNG 아이콘
<img src="/icons/icon.png" alt="아이콘" />
```

### 파비콘 설정

1. `public/icons/favicon.ico` 파일 추가
2. `src/app/layout.tsx`의 `metadata.icons`에서 자동으로 참조됨
3. 추가 아이콘 크기:
   - `icon-192.png` (192x192) - PWA용
   - `icon-512.png` (512x512) - PWA용
   - `apple-touch-icon.png` (180x180) - iOS용

## 필수 파일

### 1. favicon.ico
- 위치: `public/icons/favicon.ico`
- 크기: 16x16, 32x32, 48x48 (멀티 사이즈 권장)

### 2. manifest.json
- 위치: `public/manifest.json`
- PWA 앱 설정 파일
- `layout.tsx`에서 자동으로 참조됨

### 3. robots.txt
- 위치: `public/robots.txt`
- 검색 엔진 크롤러 설정

## 참고사항

- 모든 파일은 `/` 경로로 시작하여 접근할 수 있습니다.
  - 예: `public/images/logo.png` → `/images/logo.png`
- Next.js는 `public` 폴더의 파일을 자동으로 최적화합니다.
- 이미지 최적화를 위해서는 `next/image` 컴포넌트 사용을 권장합니다.
- HTML 파일은 필요 없습니다. `layout.tsx`가 모든 HTML 구조를 담당합니다.

