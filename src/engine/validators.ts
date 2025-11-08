import type { Question, CompositeItem } from "@/schema/question.types";

export type ValidationResult = {
  ok: boolean;
  errors: string[];
};

/**
 * 답변 값 검증
 */
export function validateAnswer(
  q: Question,
  value: unknown
): ValidationResult {
  const errors: string[] = [];

  // required 검사
  if (q.required && (value === null || value === undefined || value === "")) {
    errors.push("필수 항목입니다");
    return { ok: false, errors };
  }

  // required가 false이고 값이 없으면 통과
  if (!q.required && (value === null || value === undefined || value === "")) {
    return { ok: true, errors: [] };
  }

  // 타입별 검증
  switch (q.type) {
    case "short_text":
    case "long_text":
      errors.push(...validateText(q, value));
      break;
    case "choice":
      // dropdown 타입도 choice로 통합 (하위 호환성 유지)
      if (q.isDropdown) {
        errors.push(...validateSingleChoice(q, value));
      } else if (q.isMultiple) {
        errors.push(...validateMultipleChoice(q, value));
      } else {
        errors.push(...validateSingleChoice(q, value));
      }
      break;
    case "dropdown":
      // 하위 호환성을 위해 유지하지만 choice로 처리
      errors.push(...validateSingleChoice(q, value));
      break;
    case "complex_choice":
      errors.push(...validateComposite(q, value));
      break;
    case "complex_input":
      errors.push(...validateComposite(q, value));
      break;
    case "description":
      // description은 답변이 없어도 됨
      break;
    default:
      errors.push(`알 수 없는 질문 타입: ${q.type}`);
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}

/**
 * 텍스트 검증
 */
function validateText(q: Question, value: unknown): string[] {
  const errors: string[] = [];

  if (typeof value !== "string") {
    errors.push("텍스트 형식이 아닙니다");
    return errors;
  }

  const validations = q.validations || {};

  // minLength
  if (validations.minLength !== undefined) {
    if (value.length < validations.minLength) {
      errors.push(`최소 ${validations.minLength}자 이상 입력해주세요`);
    }
  }

  // maxLength
  if (validations.maxLength !== undefined) {
    if (value.length > validations.maxLength) {
      errors.push(`최대 ${validations.maxLength}자까지 입력 가능합니다`);
    }
  }

  // regex
  if (validations.regex) {
    try {
      const regex = new RegExp(validations.regex);
      if (!regex.test(value)) {
        errors.push("형식이 올바르지 않습니다");
      }
    } catch (e) {
      // 정규식 오류는 integrity에서 검사하므로 여기서는 무시
    }
  }

  return errors;
}

/**
 * 단일 선택 검증
 */
function validateSingleChoice(q: Question, value: unknown): string[] {
  const errors: string[] = [];

  if (typeof value !== "string") {
    errors.push("선택지 형식이 아닙니다");
    return errors;
  }

  if (!q.options) {
    return errors;
  }

  // 옵션 키 확인
  const optionKeys = q.options.map((opt) => opt.key);
  if (!optionKeys.includes(value)) {
    errors.push("유효하지 않은 선택지입니다");
    return errors;
  }

  // isOther + freeText 검사
  const selectedOption = q.options.find((opt) => opt.key === value);
  if (selectedOption?.isOther && selectedOption.freeText?.required) {
    // freeText는 별도로 검증해야 함 (여기서는 옵션 키만 검증)
  }

  return errors;
}

/**
 * 다중 선택 검증
 */
function validateMultipleChoice(q: Question, value: unknown): string[] {
  const errors: string[] = [];

  if (!Array.isArray(value)) {
    errors.push("배열 형식이 아닙니다");
    return errors;
  }

  if (!q.options) {
    return errors;
  }

  const selectedKeys = value as string[];
  const optionKeys = q.options.map((opt) => opt.key);

  // 모든 선택된 키가 유효한지 확인
  for (const key of selectedKeys) {
    if (!optionKeys.includes(key)) {
      errors.push(`유효하지 않은 선택지: ${key}`);
    }
  }

  // validations를 통한 선택 개수 제한 검증
  const validations = q.validations || {};
  const selectedCount = selectedKeys.length;
  
  // min과 max가 같으면 정확히 그 개수를 선택해야 함
  if (validations.min !== undefined && validations.max !== undefined && validations.min === validations.max) {
    if (selectedCount !== validations.min) {
      errors.push(`정확히 ${validations.min}개를 선택해주세요`);
    }
  } else {
    // min과 max가 다르거나 하나만 있는 경우
    if (validations.min !== undefined && selectedCount < validations.min) {
      errors.push(`최소 ${validations.min}개 이상 선택해주세요`);
    }
    
    if (validations.max !== undefined && selectedCount > validations.max) {
      errors.push(`최대 ${validations.max}개까지 선택 가능합니다`);
    }
  }

  // isOther + freeText 검사
  for (const key of selectedKeys) {
    const selectedOption = q.options.find((opt) => opt.key === key);
    if (selectedOption?.isOther && selectedOption.freeText?.required) {
      // freeText는 별도로 검증해야 함
    }
  }

  return errors;
}

/**
 * 컴포지트 검증
 */
function validateComposite(q: Question, value: unknown): string[] {
  const errors: string[] = [];

  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    errors.push("객체 형식이 아닙니다");
    return errors;
  }

  if (!q.compositeItems) {
    return errors;
  }

  const valueObj = value as Record<string, unknown>;

  // 각 compositeItem 검증
  for (const item of q.compositeItems) {
    const itemValue = valueObj[item.key];

    // required 검사
    if (item.required && (itemValue === null || itemValue === undefined || itemValue === "")) {
      errors.push(`${item.label}은(는) 필수 항목입니다`);
      continue;
    }

    // 값이 없으면 다음 항목으로
    if (itemValue === null || itemValue === undefined || itemValue === "") {
      continue;
    }

    // input_type별 검증
    switch (item.input_type) {
      case "text":
        errors.push(...validateCompositeText(item, itemValue));
        break;
      case "number":
        errors.push(...validateCompositeNumber(item, itemValue));
        break;
      case "email":
        errors.push(...validateCompositeEmail(item, itemValue));
        break;
      case "tel":
        errors.push(...validateCompositeTel(item, itemValue));
        break;
    }
  }

  return errors;
}

/**
 * 컴포지트 텍스트 검증
 */
function validateCompositeText(
  item: CompositeItem,
  value: unknown
): string[] {
  const errors: string[] = [];

  if (typeof value !== "string") {
    errors.push(`${item.label}은(는) 텍스트 형식이어야 합니다`);
    return errors;
  }

  const validations = item.validations || {};

  if (validations.minLength !== undefined && value.length < validations.minLength) {
    errors.push(`${item.label}은(는) 최소 ${validations.minLength}자 이상 입력해주세요`);
  }

  if (validations.maxLength !== undefined && value.length > validations.maxLength) {
    errors.push(`${item.label}은(는) 최대 ${validations.maxLength}자까지 입력 가능합니다`);
  }

  if (validations.regex) {
    try {
      const regex = new RegExp(validations.regex);
      if (!regex.test(value)) {
        errors.push(`${item.label}의 형식이 올바르지 않습니다`);
      }
    } catch (e) {
      // 정규식 오류는 무시
    }
  }

  return errors;
}

/**
 * 컴포지트 숫자 검증
 */
function validateCompositeNumber(
  item: CompositeItem,
  value: unknown
): string[] {
  const errors: string[] = [];

  const numValue = typeof value === "number" ? value : Number(value);
  if (isNaN(numValue)) {
    errors.push(`${item.label}은(는) 숫자 형식이어야 합니다`);
    return errors;
  }

  const validations = item.validations || {};

  if (validations.min !== undefined && numValue < validations.min) {
    errors.push(`${item.label}은(는) ${validations.min} 이상이어야 합니다`);
  }

  if (validations.max !== undefined && numValue > validations.max) {
    errors.push(`${item.label}은(는) ${validations.max} 이하여야 합니다`);
  }

  return errors;
}

/**
 * 컴포지트 이메일 검증
 */
function validateCompositeEmail(
  item: CompositeItem,
  value: unknown
): string[] {
  const errors: string[] = [];

  if (typeof value !== "string") {
    errors.push(`${item.label}은(는) 텍스트 형식이어야 합니다`);
    return errors;
  }

  // 간단한 이메일 패턴
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    errors.push(`${item.label}의 이메일 형식이 올바르지 않습니다`);
  }

  return errors;
}

/**
 * 컴포지트 전화번호 검증
 */
function validateCompositeTel(
  item: CompositeItem,
  value: unknown
): string[] {
  const errors: string[] = [];

  if (typeof value !== "string") {
    errors.push(`${item.label}은(는) 텍스트 형식이어야 합니다`);
    return errors;
  }

  // 간단한 전화번호 패턴 (숫자, 하이픈, 공백 허용)
  const telRegex = /^[\d\s\-+()]+$/;
  if (!telRegex.test(value)) {
    errors.push(`${item.label}의 전화번호 형식이 올바르지 않습니다`);
  }

  return errors;
}

