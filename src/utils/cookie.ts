/**
 * 쿠키 유틸리티 함수
 */

export const SURVEY_DRAFT_COOKIE_NAME = 'survey_draft';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7일

/**
 * 쿠키에 설문 초안 저장
 */
export function saveSurveyDraftToCookie(survey: any): void {
  try {
    const jsonString = JSON.stringify(survey);
    // 쿠키 값은 URL 인코딩 필요
    const encodedValue = encodeURIComponent(jsonString);
    const expires = new Date();
    expires.setTime(expires.getTime() + COOKIE_MAX_AGE * 1000);
    
    document.cookie = `${SURVEY_DRAFT_COOKIE_NAME}=${encodedValue}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
  } catch (error) {
    console.error('쿠키 저장 실패:', error);
  }
}

/**
 * 쿠키에서 설문 초안 불러오기
 */
export function loadSurveyDraftFromCookie(): any | null {
  try {
    const cookies = document.cookie.split(';');
    const draftCookie = cookies.find(cookie => 
      cookie.trim().startsWith(`${SURVEY_DRAFT_COOKIE_NAME}=`)
    );
    
    if (!draftCookie) {
      return null;
    }
    
    const encodedValue = draftCookie.split('=').slice(1).join('=');
    const jsonString = decodeURIComponent(encodedValue);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('쿠키 불러오기 실패:', error);
    return null;
  }
}

/**
 * 쿠키에서 설문 초안 삭제
 */
export function clearSurveyDraftCookie(): void {
  document.cookie = `${SURVEY_DRAFT_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

/**
 * 서버에서 쿠키를 읽어 설문 초안 불러오기 (Next.js 서버 컴포넌트용)
 */
export function loadSurveyDraftFromServerCookie(cookies: any): any | null {
  try {
    const draftCookie = cookies.get(SURVEY_DRAFT_COOKIE_NAME);
    
    if (!draftCookie) {
      return null;
    }
    
    const jsonString = decodeURIComponent(draftCookie.value);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('서버 쿠키 불러오기 실패:', error);
    return null;
  }
}

