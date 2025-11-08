/**
 * 옵션 인덱스를 알파벳 레이블로 변환합니다.
 * 0 -> 'A', 1 -> 'B', 2 -> 'C', ...
 * 
 * @param index - 옵션의 인덱스 (0부터 시작)
 * @returns 알파벳 레이블 (A, B, C, ...)
 */
export function getOptionLabel(index: number): string {
  return String.fromCharCode(65 + index); // 65는 'A'의 ASCII 코드
}

